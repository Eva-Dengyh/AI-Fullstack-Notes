# RAG 实战：从手写 MVP 链路到生产级优化

**摘要**：从零手写 LangChain RAG 链路，解析切片策略、混合检索、重排序（Rerank）及向量数据库实战指南。

---

## 01 核心能力要求

在 RAG（检索增强生成）的工程落地中，我们不能只停留在"知道概念"的层面。一个合格的 RAG 工程师必须具备以下能力：

- ✅ **基础链路闭环** 能够手写出完整的：文档加载 → 切片 (Chunking) → 向量化 (Embedding) → 存储 (Vector DB) → 检索 → 提示词组装 → 模型生成
- ✅ **精细化切片策略** 不盲目按字数切分，掌握语义切分与 Markdown 标题层级切分
- ✅ **多路召回与重排序** 理解为什么单一向量检索不够用，如何引入 Rerank 解决精度问题
- ✅ **混合检索 (Hybrid Search)** 能够结合 Elasticsearch (BM25) 的关键词搜索与 Vector 的语义搜索
- ✅ **向量库实战** 熟练掌握 Chroma 或 Milvus 的 CRUD 及索引配置

---

## 02 标准 LangChain MVP 实现

*(Minimum Viable Product)*

```python
# --------------------------
# 1. 切片 (Chunking)
# 策略：按字符递归切分，保留上下文
# --------------------------
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,       # 每一块约 500 字符
    chunk_overlap=50,     # 重叠 50 字，保证句子不被腰斩
    separators=["\n\n", "\n", "。", "!", "?"]  # 优先按段落切
)
splits = text_splitter.split_documents(docs)

# --------------------------
# 2. 向量化 & 存储 (Embedding & Vector DB)
# --------------------------
# 调用 OpenAI API 将文字转为向量 [0.1, -0.2, ...]
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=OpenAIEmbeddings(),
    persist_directory="./chroma_db"  # 持久化存储
)

# --------------------------
# 3. 检索 (Retrieval)
# --------------------------
# 找出最相似的 Top 3 片段
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
question = "TSLA 2025 Q4 的净利润率是多少？"
retrieved_docs = retriever.invoke(question)

# --------------------------
# 4. 提示词组装 (Prompt Assembly)
# --------------------------
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""
根据以下上下文回答问题，如果上下文中没有相关信息，请如实说明。

上下文：
{context}

问题：{question}
""")

# --------------------------
# 5. 模型生成 (Generation)
# --------------------------
llm = ChatOpenAI(model="gpt-3.5-turbo")
chain = prompt | llm

# context 由检索出的 docs 拼接而成
response = chain.invoke({
    "question": question,
    "context": "\n\n".join([doc.page_content for doc in retrieved_docs])
})

print(response.content)
```

---

## 03 进阶：RAG 效果不好怎么办？                             
                                                              
  这是面试和实战中最常见的问题。我们通常从以下三点入手优化：

  ---                                                         
   
  ### 1. 优化切片策略 (Chunking Strategy)                      
                  
  **🔴 痛点**                                                 ─
                  
  死板地按 500 字切分，容易把 `"2025年营收："` 切在上一段，而把具体的 `"100亿"`切在下一段。检索时上下文丢失，导致大模型幻觉。              
                  
  **🟢 解决方案**

  ### 语义切分 (Semantic Chunking)                            
   
  利用 Embedding 计算前后句子的相似度，意思连贯时不切，突变时才切。

  #### Markdown 标题切分                                       
   
  按照 `# 一、财务摘要`、`## 1.1 营收`这种层级切分。检索时，内容会带上 `财务摘要 > 营收`的元数据，极大地提高了上下文准确度。                        
                  
  ---

  ### 2. 混合检索 (Hybrid Search)

  **🔴 痛点**

  | 检索方式 | 优势 | 劣势 |                                  
  |---|---|---|
  | 向量检索 (Dense) | 擅长搜概念（搜"水果"能召回"苹果"） |   专有名词精度低 |                                            
  | 关键词检索 (Sparse/BM25) | 擅长搜专有名词（如股票代码`600519`）| 语义理解弱 |                                    
                  
  **🟢 解决方案**                                             ─
                  
  如果用户问 `"600519的代码是多少？"`，需要结合 Elasticsearch (BM25) 和 Chroma (Vector) 的结果，加权输出。
                                                              
  **参考公式：**  

  Final Score = 0.7 × Vector_Score + 0.3 × BM25_Score

  ---

  ### 3. 重排序 (Rerank)                                       
   
  **🔴 痛点**                                                 ─
                  
  初步检索出的 Top 5 内容，可能混入了只包含关键词但语义无关的噪音。

  **🟢 解决方案**                                             ─
   
  采用 **Two-Stage Retrieval（两阶段检索）**：                
                  
  1. **粗排** — 用向量库快速召回 50 条相关片段（速度快，精度一般）
  2. **精排** — 使用 Cross-Encoder（如 `bge-reranker`）对这 50 条进行精细打分，选出 Top 5 给大模型                        
   
  > **效果：** 虽然增加了约 200ms 耗时，但准确率会有质的飞跃。
---

## 04 向量数据库 (Chroma) 实战速查

### 1. 创建 / 读取集合

```python
import chromadb

client = chromadb.PersistentClient(path="./db")
collection = client.get_or_create_collection(name="finance_reports")
```

### 2. Upsert（更新或插入）

> ⚠️ 注意：必须指定唯一的 `ids`，否则数据会重复堆积。

```python
collection.upsert(
    documents=["苹果公司 Q3 营收上涨...", "特斯拉销量下跌..."],
    metadatas=[{"source": "report1.pdf"}, {"source": "report2.pdf"}],
    ids=["doc1", "doc2"]
)
```

### 3. Query（查询）

```python
results = collection.query(
    query_texts=["特斯拉销量怎么样？"],
    n_results=2
)
```

---

## 05 深度 Q&A：工程化避坑指南

  ### Q1：PDF 里的表格怎么处理？                              
   
  直接用 `PyPDFLoader` 加载表格会变成乱码，语义全毁。         
                  
  ✅ **实战解法：**                                           ─
                  
  使用 `pdfplumber` 或 `Unstructured`                         
  库。检测到表格结构时，将其提取并转化为 Markdown 格式（如 `| 科目 | 金额 |`），再进行 Embedding。这样向量模型就能理解这是结构化数据，而不是乱码。


  ### Q2：加了 Rerank 速度变慢怎么办？

  Rerank 确实会增加 300ms-500ms 的延迟。                      
   
  ✅ **优化策略：**                                           ─
                  
  **限制数量**
  初筛 50 条，Rerank 只排前 10 条。
                                                              
  **流式输出 (Streaming)**
  后端拿到 LLM 第一个 token 就通过 SSE 推送给前端。用户看到字在蹦，心理等待感会降低很多。          
                                                       
                  
  ### Q3：怎么证明 RAG 变准了？

  不能靠感觉，要靠数据。                                      
   
  ✅ **评估方法：**                                           ─
                  
  1. 构建一个包含 50 个高频问题的"金标准测试集"
  2. 每次优化策略后，运行脚本计算 **召回率 (Recall)**（即 Top
  3 结果里是否包含正确答案）                                  
  3. 只有召回率提升（如从 60% → 80%）时，才上线新代码
                 
                                                              
  ### Q4：怎么解决"上下文断裂"问题？

  比如"茅台营收"这句话，一半在 Chunk A 结尾，数字在 Chunk B 开头。

  ✅ **实战配置：**

  利用 `chunk_overlap`（切片重叠）：                          
   
  Chunk Size = 500                                            
  Overlap    = 50 ~ 100
     
  这样 Chunk B 的开头会重复 Chunk A 的结尾，保证关键信息（主语 + 数字）完整出现在至少一个 Chunk 中。                      
                                                 
                  
  ### Q5：流程这么长，怎么优化 Latency？                      
   
  如果用户等 10 秒，体验就崩了。                              
                  
  ✅ **三层优化：**

  | 层级 | 策略 |                                             
  |---|---|
  | **体验层** | 全链路流式输出 (Streaming/SSE) |             
  | **架构层** | 向量检索和 BM25 并行执行；Rerank 后只选 Top 3给大模型（减少 Input Token） |                             
  | **兜底层** | 引入 Redis 语义缓存，问题被问过则直接返回缓存答案，耗时仅需 0.1s |
---

*本文首发于 小邓同学的研习社*
