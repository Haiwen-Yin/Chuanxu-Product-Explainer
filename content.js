/* Product explanations based on the Chuanxu v5.0.5 implementation and product guides. */
(() => {
  const node = (id, title, sub, icon = 'box') => ({ id, title, sub, icon });
  const step = (title, business, technical, active, event) => ({ title, business, technical, active: active.split(' '), event });
  const scene = (id, name, description, nodes, steps, extra = {}) => ({ id, name, description, nodes, steps, layout: 'flow', ...extra });
  const card = (icon, title, copy, implementation) => ({ icon, title, copy, implementation });
  const chapters = [
    { id: 'index', number: '00', name: '产品总览', en: 'OVERVIEW', short: '从一次提问，到一次有据可循的工作', icon: 'flow' },
    { id: 'knowledge', number: '01', name: '知识与记忆', en: 'KNOWLEDGE & MEMORY', short: '把资料变成可授权、可追溯的依据', icon: 'book' },
    { id: 'collaboration', number: '02', name: '协作与执行', en: 'COLLABORATION', short: '让任务、执行与责任连续起来', icon: 'nodes' },
    { id: 'governance', number: '03', name: '身份与治理', en: 'IDENTITY & GOVERNANCE', short: '每一次读取和执行，都有明确边界', icon: 'shield' },
    { id: 'runtime', number: '04', name: '模型与运行', en: 'MODEL OPERATIONS', short: '把模型请求变成可管理的运行过程', icon: 'pulse' },
    { id: 'integrations', number: '05', name: '能力与接入', en: 'CAPABILITIES & INTEGRATIONS', short: '按契约连接模型、工具和外部 Agent', icon: 'plug' },
    { id: 'architecture', number: '06', name: '数据库底座', en: 'DATABASE NATIVE', short: '同一产品目标，尊重不同底座的原生能力', icon: 'database' },
  ];
  const pages = {
    knowledge: {
      headline: ['让知识有来源，', '让回答有依据。'],
      intro: '从授权检索、回答表达和独立私有记忆，到资产来源、官方事件与复盘草稿，把来源、版本、时间和访问范围贯穿起来。Agent 无须加入频道即可保存自己的记忆，知识入库另走审核链路。',
      tags: ['授权检索与记忆', '官方事件与复盘', '上下文依据'],
      question: '一份资料，如何成为可靠的工作依据？',
      scenes: [
        scene('retrieval', '授权检索', '以“当前版本的部署条件”为例，追踪问题如何变成有来源的回答。', [
          node('question', '提出问题', '产品 · 版本 · 时间', 'message'), node('scope', '限定授权范围', 'Human ∩ Agent', 'shield'),
          node('retrieve', '多信号检索', '数据库内融合排序', 'search'), node('evidence', '核对证据', '条件 · 冲突 · 修订', 'layers'),
          node('model', '组装模型输入', '获准披露 · 有界上下文', 'spark'), node('answer', '回答与引用', '精确来源 · 再次校验', 'check'),
        ], [
          step('先明确，问的是哪一个版本。', '识别问题中的产品、版本和适用时间，避免用旧说明回答当前部署问题。', '精确关系属性与生命周期条件参与查询；不能只依靠语义相似度判定适用性。', 'question', 'QUESTION → scope identified'),
          step('先划范围，再寻找答案。', '只在发起人和执行 Agent 都有权使用的来源中检索。', '在候选截断前应用双主体权限、资源类型、生命周期及适用条件；高分不会覆盖权限拒绝。', 'scope', 'AUTHORITY → shared scope resolved'),
          step('让不同信号，找到同一份证据。', '关系、向量、全文、标签和有界图关系按需参与，让名称、语义和关系线索相互补充。', '数据库原生召回与确定性融合不增加生成模型排序调用；查询 Embedding 与最终生成仍消耗资源。', 'retrieve', 'RETRIEVE → authorized candidates'),
          step('找到候选，还要判断是否足够。', '保留否定、条件、冲突与缺失信息。资料不足时提示缺口。', '候选加载绑定精确修订和原文位置；向量不可用时仅采用已配置且获准的文本路径。', 'evidence', 'EVIDENCE → conditions preserved'),
          step('把恰当的材料交给恰当的模型。', '只把获准披露的来源放入选定模型的上下文，保留回答所需空间。', '核对 Profile 披露授权、来源修订与上下文预算；预算不足会阻止派发。', 'model', 'CONTEXT → approved disclosure'),
          step('让每个结论，能够回到原文。', '回答区分知识依据、模型补充和推断。点击引用时仍检查当前权限。', '引用回读重新校验精确来源；历史答案不能恢复已撤销的访问权。', 'answer', 'ANSWER → source-bound citations'),
        ], { signals: ['关系属性', '向量', '全文', '标签', '图关系'] }),
        scene('answer-expression', '回答表达与边界', '资料找对之后，仍要分清模型如何使用这些依据。', [
          node('sources','绑定实际依据','授权 · 精确引用','book'),node('distinguish','区分结论类型','原文 · 计算 · 建议','layers'),node('unknown','保留未知与条件','时间 · 否定 · 冲突','clock'),node('confidence','说明证据与缺口','排序 ≠ 正确概率','search'),node('screen','有限规则筛查','无依据自信度 · 暂缓展示','shield'),node('cite','回读原始资料','引用有效 ≠ 逐句核验','check'),
        ], [
          step('先明确，这次到底用了什么。','将表达约束绑定到最终保留的授权引用窗口。','约束随既有回答计划传入模型，不增加生成排序调用，也不建立另一份权威知识。','sources','EVIDENCE → final reference window'),
          step('原文、计算和建议，分别说清。','说明哪些是来源陈述，哪些是本地整理、条件推断或待确认建议。','提示约束区分结论类型；它不能保证模型理解正确，建议不会因此变成批准或已执行动作。','distinguish','CLAIM → meaning distinguished'),
          step('没有依据的细节，保持未知。','未知不补成零，未报告不说成没有；保留事件、采集和适用时间的区别。','冲突、来源修订和限定条件继续随上下文传递；入库较晚不代表事实较新。','unknown','UNKNOWN → not zero or absence'),
          step('用证据说明把握，避免虚构概率。','解释有哪些支持、还缺什么，而不是给回答标一个没有校准依据的百分比。','检索排序、引用数量和模型自评分不能推导回答正确概率。来源中的统计数值仍有自己的对象与含义。','confidence','CONFIDENCE → evidence and gaps'),
          step('接收完整回答，再作有限检查。','发现部分明确的无依据数字自信度声明时，暂缓展示该次回答。','带表达约束的频道回答在终态检查后发布；有限规则不做逐句事实核验，也不自动重采掩盖失败。','screen','SCREEN → bounded publication rules'),
          step('重要结论，仍要回到原文。','通过精确引用核对关键细节，并持续检查当前访问权限。','规则未命中不等于事实正确，引用有效不证明每句话受支持；复杂遗漏和推断仍需复核。','cite','REVIEW → original evidence'),
        ]),
        scene('asset-navigation', '页面与资产入口', '从可见内容开始，找到 Agent 真正可使用的资产与来源。', [
          node('visible','先看当前视图','知识 · 记忆 · 图预览','search'),node('domain','进入资产与来源','工作区 · 显式安全域','shield'),node('agent','选择目标 Agent','当前授权 · 链接状态','user'),node('assets','管理精确来源','绑定 · 同步 · 推荐','layers'),node('policy','核对回答策略','回答 · 披露 · 组织覆盖','file'),node('browser','保持请求身份','安全随机 · 幂等重试','refresh'),
        ], [
          step('打开页面，先读取当前内容。','知识列表和记忆概览独立加载，进入图或其他页签时再读取相应数据。','各区域保留加载、失败与重试反馈；有界图预览的显示数量不是全库总数。','visible','VIEW → visible resources first'),
          step('在工作区，找到资产与来源。','通过工作区的 Agent 资产与来源入口，明确选择本次工作的安全域。','没有安全域时提示选择，不能因为存在一个域就默认代选或扩大权限。','domain','WORKSPACE → explicit Domain'),
          step('选择当前有权操作的 Agent。','切换 Agent 后查看相应资产，授权范围内的选择可以通过链接恢复。','链接参数只保存界面状态；服务端继续核验当前域、Agent 与来源权限。','agent','AGENT → authorized selection'),
          step('来源、绑定与推荐，分别管理。','查看精确资产绑定、只读来源同步与 Skill 推荐，不把推荐当成执行。','现有 Source、Task 与候选版本链保持权威；同步和导入不自动发布知识。','assets','ASSETS → exact source contracts'),
          step('把回答策略与披露范围看清楚。','Portal 策略按回答控制、模型披露和组织覆盖分组，保存仍检查版本冲突。','页面布局变化不改变披露授权、组织范围或审核要求。','policy','POLICY → versioned controls'),
          step('普通 HTTP，也保留受控交互。','兼容缺少原生 UUID 的浏览器，操作重试仍使用同一幂等标识。','UUID 依赖安全随机源，缺失时受控报错；内容摘要有兼容路径，这不为 HTTP 增加传输加密。','browser','REQUEST → stable retry identity'),
        ]),
        scene('intake', '知识入库', '上传、审核、成为知识与扩大共享范围，是不同的动作。', [
          node('source', '准备来源', '用途 · 责任人 · 位置', 'file'), node('preview', '分块与质量预览', '条件 · 重复 · 缺项', 'search'),
          node('candidate', '保存候选', '草稿 · 精确修订', 'layers'), node('review', '独立审核', '审核者与作者分离', 'user'),
          node('publish', '晋升私有知识', '原生实体 · 原文位置', 'book'), node('share', '授权共享', '组织 · 安全域 · 受众', 'shield'),
        ], [
          step('带着用途和来源，开始入库。', '说明资料解决什么问题、由谁负责、适用于什么产品与时间。', '来源位置、责任、产品版本、密级和目标受众组成可检查的元数据。', 'source', 'SOURCE → provenance declared'),
          step('先预览，再决定保存什么。', '观察分块是否丢失表头、单位、否定和前提，补充缺项。', '预览不调用模型，也不保存或发布知识；质量反馈不保证事实真实。', 'preview', 'PREVIEW → no publication'),
          step('待完善的资料，可以先保留。', '草稿与候选保留工作进度，尚未审核的内容不会成为共享回答依据。', 'Web、API、MCP、CLI 和同步入口复用服务端规则；来源更新产生候选。', 'candidate', 'CANDIDATE → revision retained'),
          step('另一位审核者，作出独立决定。', '作者不能自审自批。通用候选审核与企业专属审批分别管理。', '审核绑定精确候选修订；内容变化后需针对当前修订重新判断。', 'review', 'REVIEW → independent decision'),
          step('审核通过，先得到私有知识。', '新知识保留来源与版本，进入权威实体与现有发布链路。', '目标受众仅表达提交意图；晋升不自动扩大组织或跨安全域权限。', 'publish', 'PROMOTE → private entity'),
          step('共享需要明确授权。', '决定谁可以使用这份知识，撤回与修订影响后续检索和引用。', '内容晋升与共享授权是独立动作；下游材料读取时继续核对来源权限。', 'share', 'SHARE → explicit authorization'),
        ]),
        scene('memory', '记忆与上下文', '一次任务留下的观察，如何在下次工作中被正确使用。', [
          node('event', '记录观察', '事件时间 ≠ 入库时间', 'clock'), node('revision', '保存不可变修订', '来源 · 时间 · 状态', 'layers'),
          node('conflict', '识别冲突与适用性', '迟到信息不覆盖事实', 'branches'), node('discover', '按需发现资产', '先元数据 · 后内容', 'search'),
          node('context', '加载精确上下文', '授权 · 修订 · 预算', 'book'), node('reflect', '便笺与复盘', '结论进入待审核候选', 'check'),
        ], [
          step('一条记忆，有不止一种时间。', '分别记录事件发生、观察、入库和适用时间；未知时间保持未知。', '时态字段保留语义区别，不以入库顺序替代事实顺序。', 'event', 'OBSERVE → temporal provenance'),
          step('更新内容，保留原来的版本。', '修订形成后继版本，历史仍可追溯。', '恢复历史也创建新修订，不能回退当前指针或降低密级。', 'revision', 'REVISION → immutable history'),
          step('冲突需要判断，不能静默覆盖。', '两份材料冲突时保留来源与适用条件，让后续工作看见差异。', '冲突确认与发布是独立动作，迟到数据不会因为更新入库而自动胜出。', 'conflict', 'CONFLICT → retained for review'),
          step('先知道有什么，再加载需要的。', 'Agent 先发现资产目录，再读取任务需要的精确版本。', '每次加载重新校验来源与权限，避免整本手册进入所有请求。', 'discover', 'DISCOVER → metadata first'),
          step('上下文要装得下，也不能漏条件。', '保留系统提示、工具协议、必要证据与输出空间。', '区分已知 tokenizer 计数与保守估算；预算不足时阻止派发。', 'context', 'BUDGET → required evidence retained'),
          step('把工作进度留下，把正式结论审清。', '便笺记录已验证事实、放弃的方法和下一步，复盘先成为候选。', '便笺受 Work、Handoff、期限与来源授权检查；中间想法不会自动发布为知识。', 'reflect', 'REFLECT → candidate, then review'),
        ]),
        scene('private-memory', 'Agent 私有记忆', '不加入频道，也能留下自己的工作记忆；它不会自动变成知识。', [
          node('identity','确认当前身份','Agent · 实例 · 安全域','user'),node('grant','核对自有权限','OWNED · read / write','shield'),node('write','写入正式记忆','独立 Memory 接口','book'),node('retry','安全重试','幂等键 · 内容一致','refresh'),node('owner','负责人查看','当前归属 · 当前授权','search'),node('boundary','共享另行处理','候选 · 审核 · 晋升','lock'),
        ], [
          step('记忆从当前 Agent 身份开始。','外部 Agent 完成注册和激活后，可以在自己的安全域保存私有工作记忆，无须先加入频道。','网关绑定认证 Agent、实例和安全域；凭据、令牌 scope 与当前权限分别校验。','identity','IDENTITY → no Channel prerequisite'),
          step('有身份，还要有自有记忆权限。','新注册 Agent 获得自有范围的记忆读写授权；权限被拒绝后不能继续读写。','OWNED 范围的 memory.read / memory.write 不复制 Human 角色，也不授予知识发布或跨 Agent 访问权。','grant','GRANT → OWNED memory only'),
          step('用记忆入口，保存到记忆。','工作观察进入正式记忆家族与版本，不混入知识列表。','POST /api/gateway/memory 返回 family_id；GET /api/gateway/memory/{family_id} 从 memory.current.content 回读。知识接口仍创建知识。','write','MEMORY → family and revision'),
          step('同一条写入，重试不重复创建。','网络重试沿用同一幂等键；内容变化后使用新的键。','幂等键为必填；相同键与内容复用结果，同键不同内容返回 409。业务拒绝、不可见与服务失败分别返回 403、404、503。','retry','RETRY → same intent, same result'),
          step('负责人可查，归属变化即重判。','当前有效 Human 主负责人具备记忆读取和安全域权限时，可在 Dashboard 记忆页查看。','仅 Sponsor 或同组织关系不授予私有读取权；负责人转移后按当前关系重新判定，历史归属不延续权限。','owner','OWNER → current relationship checked'),
          step('私有保存，不等于共享发布。','想把工作记忆转为频道共享或正式知识，仍要走相应候选、审核与显式晋升流程。','独立记忆接口不绕过来源、修订和当前授权，也不自动扩大组织、安全域或受众范围。','boundary','SHARE → separate governed workflow'),
        ]),
        scene('official-incidents', '官方事件采集', '用官方公开状态页，保留可以核对的事件来源。', [
          node('feed','选择官方来源','GitHub · Cloudflare','plug'),node('fetch','有界采集','HTTP · 大小 · 时间','search'),node('raw','保留原始快照','原文 · 摘要 · 修订','file'),node('replay','识别重放与更新','幂等 · 后继版本','refresh'),node('candidate','接入现有流程','Source · Task · 候选','layers'),node('access','持续检查授权','读取 · 引用 · 撤权','shield'),
        ], [
          step('从官方状态页开始。','以 GitHub 和 Cloudflare 的官方事件接口为真实来源，保留出处与事件标识。','采集器限定受支持的来源和响应契约；公开事件不能代表企业内部影响。','feed','SOURCE → official incident feed'),
          step('采集有界，失败保留原状。','限定请求时间、响应大小和事件数量，失败时不以空结果覆盖原资料。','HTTP 响应与结构先校验，再进入后续处理；原始失败单独留证。','fetch','FETCH → bounded response'),
          step('保存原文，再形成可读记录。','原始响应、事件时间和精确修订一起保留，便于回到官方记录。','摘要关联原始快照和来源位置；未知字段保持未知，不补成官方事实。','raw','SNAPSHOT → exact provenance'),
          step('同一事件，区分重放和更新。','重复采集不重复创建工作；官方更新产生可追溯的后继修订。','稳定来源标识与修订摘要支持幂等，保留先前快照和失败记录。','replay','REVISION → idempotent intake'),
          step('进入已有的任务与候选流程。','采集结果关联 Source 和 Task，待审核资料沿现有候选链路处理。','复用权威实体与版本管线，不建立旁路知识库，也不自动发布。','candidate','CANDIDATE → existing pipeline'),
          step('来源公开，平台读取仍有规则。','工作资料和引用继续接受当前权限检查；撤权后不能通过旧报告回读。','精确修订、来源绑定与当前授权共同校验，历史引用不代授访问权。','access','ACCESS → current authorization'),
        ]),
        scene('incident-report', '故障复盘草稿', '把官方事实、未知信息和待审核建议放进同一份复盘草稿。', [
          node('template','选用复盘模板','PagerDuty · 许可保留','file'),node('facts','整理已知事实','时间线 · 状态 · 依据','clock'),node('gaps','显式保留缺口','根因 · 内部影响未知','search'),node('draft','形成报告草稿','事实子集 · Schema','layers'),node('review','独立审核','核对来源与推断','user'),node('promote','显式晋升','私有知识 · 另行共享','book'),
        ], [
          step('用有出处的模板组织复盘。','参考 PagerDuty 开放复盘模板，保留许可、署名和中文字段说明。','模板、事实子集 Schema 与来源声明随研究资料保留；模板本身不证明内容正确。','template','TEMPLATE → attributed structure'),
          step('先排事实，再写判断。','把官方时间线、状态变化和事件说明关联到可回读的证据。','每条事实保留来源修订与位置；官方原文和本地投影字段分别标明。','facts','FACTS → source-bound timeline'),
          step('不知道的内容，明确写出来。','官方未说明的根因、企业内部影响与损失保持未知，建议标为待确认。','不从公开状态页推定租户影响；生成摘要仍需逐项核对来源。','gaps','GAPS → unknown remains unknown'),
          step('先交付草稿，保留证据与缺口。','报告展示事实、时间线、缺口和待审核建议，方便团队补充内部资料。','结构校验约束字段与事实子集，不能代替根因分析或业务验收。','draft','REPORT → draft with evidence'),
          step('让另一位审核者核对结论。','检查结论是否有证据，推断是否标清，内部影响是否得到实际确认。','复用候选和独立审核规则，审核绑定精确修订；作者不能自审自批。','review','REVIEW → independent decision'),
          step('审核与发布，分别作出决定。','经过独立审核后才能显式晋升；扩大共享范围还需要授权。','继续使用既有候选与版本管线，采集或生成报告都不自动发布知识。','promote','PROMOTE → explicit action'),
        ]),
        scene('context-receipts', '上下文依据', '看清模型输入选用了什么、遗漏了什么，以及发送前还要检查什么。', [
          node('scope','确定任务与范围','当前身份 · 精确来源','shield'),node('select','选择上下文表示','原文 · 摘要 · 预算','layers'),node('receipt','展示装配依据','选用 · 遗漏 · 降级','file'),node('recheck','重新核对依赖','修订 · 有效期 · 权限','refresh'),node('prepare','区分准备与发送','准备完成 ≠ 已派发','clock'),node('measure','保留测量边界','耗时 · 缓存默认关闭','pulse'),
        ], [
          step('从本次任务的授权范围开始。','依据当前身份与任务寻找材料，每份资料仍绑定精确来源。','复用既有检索与上下文装配链路，依据记录不建立平行权威状态。','scope','SCOPE → exact dependencies'),
          step('为必要材料选择合适的表示。','在预算内选择原文或已有表示，保留必要条件和回答空间。','既有预算和表示策略继续生效；必要依据装不下时不能静默截断后发送。','select','CONTEXT → bounded representation'),
          step('看见为什么选它，也看见遗漏。','把选用、遗漏和降级原因放在上下文依据中，帮助定位回答问题。','沿用装配记录，关联来源修订与准备结果；不是另建一套事实来源。','receipt','RECEIPT → selection explained'),
          step('准备过的材料，使用时仍需核对。','权限、有效期或来源修订变化后，不能直接沿用旧的准备结果。','当前授权与依赖继续重验，不以摘要、旧依据或缓存绕过撤权。','recheck','RECHECK → current dependencies'),
          step('准备完成，不代表已经发送。','分别查看上下文准备与模型派发状态，避免把预览当成真实请求。','准备结果需要通过最终传输、容量和执行权检查，才进入实际发送。','prepare','PREPARED → not yet dispatched'),
          step('观察耗时，保留收益边界。','根据实际测量判断重复准备的成本，不预先承诺节省 Token 或费用。','本版保留授权重验，未启用 query 或 TTL 缓存；共享编码实验保持关闭。','measure','MEASURE → observed cost only'),
        ]),
      ],
      experiment: { title: '共享知识，什么时候可以发布？', copy: '切换条件，观察入库与共享之间的区别。', type: 'knowledge', toggles: ['来源与责任信息完整', '独立审核已通过', '共享范围已获授权'] },
      cards: [card('search', '检索与引用', '按授权范围寻找适用的原文，回答可回到精确来源。', '关系、向量、全文、标签和有界图关系按需融合；引用读取再次鉴权。'), card('file', '入库与发布', '从用途、来源和质量预览开始，保留审核与发布过程。', '草稿、候选、独立审核、私有晋升与共享授权分别管理。'), card('clock', '时态记忆', '保留发生、观察和适用时间，让旧事实与新修订有据可查。', '不可变修订、冲突关系与后继版本共同表达沿革。'), card('layers', '工作便笺与资产', '留下工作进度，按需加载下一次任务真正需要的材料。', '来源绑定、精确版本、期限与上下文预算共同约束。')],
    },
    collaboration: {
      headline: ['任务可以接续，', '责任始终清楚。'], intro: '把对话延伸为持续工作：谁正在做、依据哪个版本、交给谁、完成了什么，都落在可追溯的记录里。', tags: ['Task · Graph · Loop', 'Work · Handoff', 'DB4A2A'], question: '当工作跨越多个 Agent，如何不断线？',
      scenes: [
        scene('handoff', '责任交接', '用一次研发问题交接，解释 Work 与 Handoff 怎样保持连续。', [node('goal','建立 Work','目标 · 责任 · 验收','flag'),node('task','关联 Task','步骤 · 结果 · 版本','list'),node('offer','提出交接','精确修订 · 待接收','send'),node('accept','接收者确认','以自身权限读取','user'),node('execute','继续工作','便笺 · 决策 · 证据','nodes'),node('receipt','结果与验收','回执 ≠ 自动业务批准','check')], [
          step('先定义，要完成什么。','Work 记录目标、当前责任和验收条件，Task 承载具体步骤。','稳定工作身份关联版本、任务和资源，摘要不能代替权威状态。','goal','WORK → owner & acceptance'),
          step('把已经做过的事，关联到工作。','保留复现、排除方法、测试和未决问题，接手者能够找到依据。','Task、Graph、便笺及来源快照保留捕获时间和精确修订。','task','TASK → evidence attached'),
          step('发出提议，还没有完成交接。','提议说明下一步、所需上下文与预期版本，等待接收确认。','Handoff 绑定当前 Work 修订、来源引用、接收者和交接策略。','offer','HANDOFF → offered'),
          step('接收者确认，责任才能转移。','默认单接收方在接受后承接责任；引用不自动赋予访问权。','接收者以自身身份读取，重新核对当前授权、版本与状态。','accept','HANDOFF → accepted'),
          step('新 Agent 接着做，依据仍可核对。','继续使用已批准的决策、实际执行结果和剩余问题。','显式并行交接可限定 2–16 个接收方，协调者保留责任；该数字不是容量指标。','execute','WORK → continuation started'),
          step('留下结果，交给约定的标准验收。','执行回执与实际测试说明发生了什么，业务批准单独进行。','结果读取仍检查原始来源和当前授权；不能只凭生成的总结判定完成。','receipt','RESULT → receipt recorded'),
        ]),
        scene('graph', '执行图与循环', '从计划、依赖到受控执行，让一次自动化可以说明经过。', [node('plan','编制运行蓝图','Harness · 目标与验收','file'),node('compile','编译发布 Graph','精确计划 · 版本','nodes'),node('dispatch','派发节点','当前授权 · 租约','send'),node('barrier','等待依赖与屏障','参与者快照 · 到达','branches'),node('loop','有界 Loop','次数 · Token · 时间','refresh'),node('result','记录实际结果','attempt · 检查点 · 回执','check')], [
          step('明确目标，也明确如何验收。','Harness 组织任务、环境和成功条件。','运行蓝图不自动授予模型、工具或数据库权限。','plan','HARNESS → acceptance defined'),
          step('运行绑定一份已发布计划。','图中的 Agent、模型、工具、人和事件节点遵循明确依赖。','编译后发布具体版本，运行绑定该精确计划，保留节点和依赖。','compile','GRAPH → exact plan published'),
          step('Worker 只能执行自己当前拥有的工作。','每次尝试有独立记录，过期执行器不能继续发布结果。','Lease 限定执行权；fencing 拒绝失效 Worker 的写入。','dispatch','ATTEMPT → current lease acquired'),
          step('等待有据可查，不占执行租约。','并行分支到达屏障后再继续，能够知道还在等谁。','屏障记录参与者快照及到达，等待阶段不占 Worker 执行租约。','barrier','BARRIER → arrivals recorded'),
          step('迭代有边界，恢复也有预算。','按测试、人工或指定评价方式判断下一轮，达到条件即停止。','次数、Token、时间与停止条件共同约束；重启或分叉不重置处理预算。','loop','LOOP → bounded iteration'),
          step('把实际发生的事留下来。','节点结果、检查点与失败分开记录，便于查验和恢复。','未知外部副作用先查询真实状态；逻辑去重不保证任意远程系统恰好执行一次。','result','RUN → evidence committed'),
        ]),
        scene('db4a2a', '共享上下文协作', 'Agent 传递一个小信封，接收者再读取获准的上下文。', [node('agentA','Agent A','发起已授权工作','user'),node('envelope','创建任务信封','Task ID · Context Ref','send'),node('db','数据库权威上下文','版本 · 摘要 · 分支','database'),node('agentB','Agent B','以自身身份读取','user'),node('branch','明确分支策略','默认只读 · 派生需授权','branches'),node('receipt','关联结果回执','原 Task · 原上下文','check')], [
          step('把工作关联到共同的数据平面。','来源、任务和上下文保留在获准的数据库中。','DB4A2A 是数据库上下文引用协作模式；不替代标准 A2A。','agentA','DISPATCH → authorized source'),
          step('传引用，也传清楚预期。','信封包含任务、上下文、摘要、预期版本与范围。','task_id、context_ref、snapshot_digest、expected_version、scope_ref 与 branch_policy 绑定协作契约。','envelope','ENVELOPE → precise references'),
          step('保留一份权威状态。','接收者可以核对来源，而不必依赖复制过来的整段聊天。','共享上下文依赖共同获准的数据平面；收益由实际场景验证，不承诺统一节省比例。','db','SOURCE → authoritative revision'),
          step('引用不会授予权限。','Agent B 只能读取自己当前获准的材料。','读取时重新核对原资源、身份与版本；不能借 Owner 或另一方凭证读取。','agentB','READ → recipient authority'),
          step('默认不改来源，派生要有决定。','需要工作分支时明确授权，合并回原分支也单独决定。','分支策略、派发记录和原始上下文保持一致。','branch','BRANCH → explicit policy'),
          step('结果仍然回到原工作。','Task、上下文与结果关联，继续工作的 Agent 可核对真实进展。','无共同数据平面时，仍使用 A2A 的负载或工件传输方式。','receipt','RECEIPT → original work linked'),
        ]),
      ],
      experiment: { title: '一条迟到的结果，可以写入吗？', copy: 'Worker 的执行权和目标版本必须仍然有效。', type: 'collaboration', toggles: ['Worker 租约仍有效', '目标版本与预期一致', '结果来源授权仍有效'] },
      cards: [card('list','Task 与 Step','把工作拆成可追踪的步骤，每次尝试有稳定关联。','持久状态、attempt、租约、fencing 与幂等标识。'),card('nodes','Graph 与 Loop','表达并行、依赖、屏障和有界迭代。','运行绑定已发布计划，预算不会因重启或分叉归零。'),card('send','Work 与 Handoff','将目标、责任、上下文和回执一起交接。','提议、接受、开始、结果和业务验收分开记录。'),card('message','Channel 与 Workspace','让沟通、工作分支与上下文关联起来。','频道成员关系不扩大知识或数据库访问权。')],
    },
    governance: {
      headline: ['每一次行动，', '都有自己的边界。'], intro: '人、Agent 和资源各有身份与授权。通过统一弹窗查看并调整 Agent 业务权限，把当前负责人、可管理范围、变更版本和审计一起核对。', tags: ['双主体授权', '业务权限弹窗', '可追溯审计'], question: '同一个问题，为什么不同身份看到的不同？',
      scenes: [
        scene('intersection','双主体授权','一次知识辅助工作，需要同时满足发起人和执行 Agent 的当前权限。',[node('human','发起 Human','身份 · 会话 · 当前角色','user'),node('agent','执行 Agent','责任人 · 实例 · 凭证','box'),node('intersection','计算授权交集','Human ∩ Agent','shield'),node('resource','核对资源范围','安全域 · 生命周期','layers'),node('disclose','核对披露对象','模型 Profile · 用途','spark'),node('allow','允许本次动作','读取与执行分别检查','check')],[
          step('先确认，是谁在发起。','人用户通过受控身份与会话进入，组织和角色参与当前权限计算。','MFA、会话作用域、CSRF 与来源 IP 控制各司其职。','human','HUMAN → authenticated principal'),
          step('再确认，是谁在执行。','Agent 必须有有效责任人，注册、激活、就绪与授权分别核对。','实例、原凭证、租约和 fencing 关联执行身份。','agent','AGENT → current instance'),
          step('两边都有权，来源才能使用。','执行者不能借用发起者全部权限，也不能借 Owner 绕过限制。','候选截断前限定双主体交集；权限拒绝不能触发更宽的回退。','intersection','AUTHORITY → intersection only'),
          step('还要满足资源本身的条件。','资料密级、安全域、生命周期、版本和时间继续生效。','频道成员资格不赋予成员之间全部资料的读取权。','resource','RESOURCE → applicability checked'),
          step('看得见，不等于可以交给任何模型。','核对模型是否获准接收这类资料。','披露授权绑定 Profile 与来源；无法披露时按策略提供获准摘录。','disclose','DISCLOSURE → approved recipient'),
          step('本次允许，留下本次依据。','权限变化会影响后续读取和执行，历史事实仍保留。','历史快照和旧令牌不能恢复撤销的当前访问权。','allow','DECISION → auditable result'),
        ]),
        scene('identity','身份与撤销','从外部 Agent 接入，到实例运行和权限撤销。',[node('register','受控注册','责任人 · 注册契约','file'),node('prove','证明身份','一次性秘密 / Ed25519','key'),node('activate','激活与就绪','状态分别检查','pulse'),node('credential','实例短期凭证','绑定实例与作用域','shield'),node('operation','执行前重新核验','原凭证 · 来源 · 租约','refresh'),node('revoke','撤销后拒绝继续','旧请求保留真实状态','lock')],[
          step('登记一个 Agent，先明确责任。','业务 Agent 关联有效 Human 主要责任人。','注册契约、角色与资源授权分开管理。','register','REGISTER → responsible Human'),
          step('声明身份，需要完成证明。','通过一次性秘密或 Ed25519 证明建立可信身份。','证明成功才进入相应接入状态；名称不能作为凭证。','prove','PROOF → identity verified'),
          step('激活后，还要核对运行条件。','模型、工具、知识和主机条件都需满足。','注册、激活、运行就绪不是同一状态。','activate','ACTIVATE → readiness checked'),
          step('给实例颁发有范围的短期凭证。','凭证关联实际实例，限定作用域与有效期。','令牌作用域不代替资源权限；服务端保留凭证绑定。','credential','TOKEN → instance-bound scope'),
          step('真正执行前，再检查一次。','从排队到派发期间发生的撤权必须生效。','Worker 复核原凭证、当前来源、实例与租约。','operation','DISPATCH → authority rechecked'),
          step('撤销旧授权，不能换令牌接着发。','停止未获准的后续动作，保留已发生事实。','新凭证不能为旧请求补造授权；未知请求不盲目重发。','revoke','REVOKE → future action denied'),
        ]),
        scene('business-permissions','业务权限弹窗','给 Agent 调整有限的业务权限，保存结果与失败反馈留在同一窗口。',[
          node('open','打开业务权限','智能体 · 已注册智能体','user'),node('inspect','核对实际权限','角色 · 直接授权 · 范围','search'),node('scope','限定可管理项','负责人 / 权限管理员','shield'),node('change','选择变更并说明','授权 · 拒绝 · 恢复角色','file'),node('save','按当前版本保存','冲突 · 重试 · 审计','check'),node('close','回到原来位置','Esc · 焦点返回 · 窄屏','refresh'),
        ],[
          step('从目标 Agent，打开业务权限。','在 Dashboard 智能体的已注册列表中，点击该行的业务权限，打开居中弹窗。','弹窗复用统一表格、表单和间距；背景暂停交互，不跳转到另一套页面。','open','DIALOG → selected Agent'),
          step('先看实际权限，再决定修改。','同时查看生效权限、数据范围和直接授权记录，区分角色提供的权限与单独设置。','显示服务端当前权限与版本；前端可见按钮不代替后端授权检查。','inspect','INSPECT → effective permission and scope'),
          step('负责人和管理员，能力各有边界。','有智能体管理权的当前负责人可管理自有记忆权限；有用户权限管理能力的管理员还能管理可见 Agent 的知识权限。','只允许规定的记忆、知识权限与范围，不提供任意角色或数据库管理员提权入口。','scope','SCOPE → bounded manager authority'),
          step('说明原因，明确这次要改什么。','选择授权、拒绝或恢复角色权限，并填写变更原因。','原因输入、选择项和保存按钮保持等高对齐，窄屏自动换行；恢复角色权限会移除对应直接覆盖。','change','CHANGE → reason and explicit operation'),
          step('按当前版本保存，冲突先刷新。','保存成功或失败直接显示在弹窗内，加载失败可重试；版本冲突时先读取最新状态再决定。','提交绑定权限版本并记录审计，旧版本不能覆盖新决定；重试不绕过当前负责人和范围检查。','save','SAVE → version checked and audited'),
          step('完成操作，回到原来的位置。','关闭后返回触发按钮，键盘可用 Esc 退出；Tab 在窗口内循环，手机上也可阅读和操作。','焦点、背景滚动和可访问名称由共享弹窗行为约束；布局检查覆盖中英文与明暗主题。','close','RETURN → focus restored'),
        ]),
        scene('audit','治理与审计','从一次业务动作，看到公共审计与企业治理各自的职责。',[node('action','业务动作','当前身份 · 目标资源','send'),node('policy','策略与批准','通用控制 / 企业治理','shield'),node('execute','受控执行','来源 · 版本 · 当前权','nodes'),node('audit','关联审计记录','动作 · 决定 · 结果','file'),node('enterprise','企业治理视图','职责分离 · 保留策略','layers'),node('review','查验与受限导出','授权范围内的证据','search')],[
          step('动作从明确的主体开始。','分清谁提出、谁批准、谁实际执行。','Human、Agent 与数据库 Owner 不互相代授权限。','action','ACTION → principal & resource'),
          step('按产品范围应用控制。','公共路径保留必要审计；企业版增加专属审批和治理。','通用知识候选独立审核不等于企业专属审批。','policy','POLICY → edition-aware controls'),
          step('批准不是无限授权。','执行仍要满足当时的资源、来源和实例条件。','执行前重新核验批准对象、具体修订和当前权。','execute','EXECUTE → current contract'),
          step('记录事实，也记录拒绝。','把动作、决定、来源与结果关联，便于后续查验。','元数据用量台账不保存提示词、回答或隐藏推理正文。','audit','AUDIT → linked evidence'),
          step('企业治理覆盖更完整的管理职责。','按部署需求管理策略、保留、法律保全及职责分离。','企业版增加审批、审计管理视图、LDAP、治理与合规模块。','enterprise','GOVERN → controlled retention'),
          step('证据可查，导出仍有边界。','查看者只能获得当前授权范围内的记录。','技术控制不等于监管认证；合规 Agent 的建议不继承管理员权力。','review','REVIEW → authorized evidence'),
        ]),
      ],
      experiment: { title: '谁能使用这份资料？', copy: '权限取交集，不能用一方的允许覆盖另一方的拒绝。', type: 'governance', toggles: ['Human 有来源读取权', 'Agent 有来源读取权', '来源仍在适用期内'] },
      cards: [card('user','Human 与 Agent','分别确认身份、责任、会话和运行状态。','组织、角色、实例及凭证共同参与授权。'),card('shield','安全域与资源','让业务协作有边界，避免对话关系扩大数据权限。','双主体交集、资源范围、来源修订和披露检查。'),card('lock','运行隔离','在具备所需主机条件时执行，缺少证据则拒绝。','独立身份、namespace、cgroup v2、seccomp 等按契约核验。'),card('file','企业治理','面向审批、审计管理、LDAP、保留与合规职责。','按企业版交付范围启用；社区版仍保留公共路径必要审计。')],
    },
    runtime: {
      headline: ['让每一次模型调用，', '成为可管理的过程。'], intro: '从请求生命周期、未知结果恢复到最终传输检查，用明确的 Profile、能力证据和容量协调组织请求，分别核对输入、输出与实际状态。', tags: ['Profile 与路由', '最终传输检查', '用量与恢复'], question: '当模型很忙，或结果没有回来，应该怎么做？',
      scenes: [
        scene('request','请求生命周期','从配置模型到记录结果，分清每个阶段。',[node('profile','选择 Profile','配置 · 修订 · 能力证据','spark'),node('budget','核验输入预算','系统 · 工具 · 证据 · 输出','layers'),node('capacity','等待共享容量','同一权威协调器','clock'),node('dispatch','正式派发','原授权 · 当前租约','send'),node('response','接收并校验','拒答 · 截断 · Schema','check'),node('usage','记录观测与用量','排队 · 首内容 · 总时长','pulse')],[
          step('从经过核验的配置开始。','选择明确修订的 Profile，按实际探测证据使用流式、结构化或工具能力。','模型名或 /v1 地址不能证明能力；TEXT_JSON 与精确 schema 的 NATIVE_STRICT 分别管理。','profile','PROFILE → verified capability'),
          step('上下文预算先于请求。','给系统、工具协议、证据和输出留出空间。','必要条件不能静默截掉；不足时阻止派发并调整任务或批准配置。','budget','INPUT → budget admitted'),
          step('共同的资源，需要共同协调。','共享模型服务的请求由同一容量权威管理。','参与身份、地址别名和 Profile 版本注册到权威协调器；各库独立加锁不会形成全局队列。','capacity','CAPACITY → coordinated admission'),
          step('发出之前，再确认能够发。','复核来源、原凭证、请求摘要和当前执行权。','业务来源授权与中央容量授权各自验证，不互相代授私有权限。','dispatch','SEND → exact request bound'),
          step('返回了，还要看返回了什么。','完整传输、结构有效与业务验收分别判断。','拒答、截断、Schema 失败与业务语义不通过分别记录。','response','RESPONSE → contract checked'),
          step('把真正观察到的用量记下来。','兼容累计用量和零占位统计，保留已完成回答；未知用量与价格仍保持未知。','累计快照不重复相加，一致终态可补充统计；倒退或终态矛盾仍拒绝，平台估算不等于账单。','usage','USAGE → consistent cumulative facts'),
        ]),
        scene('unknown','未知结果与恢复','客户端超时，不代表远端已经停止。',[node('send','请求已发出','真实请求有唯一关联','send'),node('disconnect','本地连接中断','超时 / 取消 / 失联','pulse'),node('unknown','保留未知状态','UNOBSERVED','clock'),node('reconcile','核对真实完成','请求 · 进程 · Provider','search'),node('decision','批准有界恢复','精确版本 · 预算','shield'),node('continue','按实际结果继续','完成 / 补偿 / 新尝试','check')],[
          step('派发之后，要跟踪实际请求。','记录已经发送的请求与具体尝试，后续恢复从这里开始。','原凭证、执行 fence、来源和请求摘要保持绑定。','send','REQUEST → sent'),
          step('本地停止等待，远端可能仍在运行。','超时或取消不能证明 Provider 已停止计算。','客户端断开与上游取消证据是不同事实。','disconnect','CLIENT → disconnected'),
          step('结果未知，就明确记为未知。','暂不当作失败重试，也不当作成功交付。','原请求未确认完成前不释放其占用并盲目重发。','unknown','STATE → UNOBSERVED'),
          step('先查清，之前究竟发生了什么。','检查真实请求、进程或可信 Provider 记录。','租约过期不能替代请求完成观测；保留原超时与失败证据。','reconcile','RECONCILE → actual lifecycle'),
          step('恢复需要精确的决定。','由授权者确认目标、版本、预算和可能的外部副作用。','重启不重置处理预算；新令牌不替代旧请求的已撤销凭证。','decision','RECOVERY → bounded approval'),
          step('依据真实状态，继续工作。','已完成就读取结果，未执行则按批准重试，副作用不明则先查询。','恢复接受、派发、成功和业务批准分别记录。','continue','CONTINUE → observed outcome'),
        ]),
        scene('final-transport', '最终传输检查', '核对真正发送的 Provider 输入，并保留附件与独立审计边界。', [
          node('assemble','组装完整请求','消息 · 工具 · 附件字段','layers'),node('inspect','检查最终 JSON','文本 · 披露 · 预算','search'),node('serialize','固定序列化结果','同份 bytes 发送','file'),node('send','通过后再发送','当前授权 · 容量 · 租约','send'),node('output','校验完整输出','拒答 · 截断 · Schema','check'),node('limits','保留检查边界','图片语义 · 独立字节审计','shield'),
        ], [
          step('把检查放到实际请求组装之后。','同时核对消息、工具和附件字段，避免只查看较早的上下文片段。','公共 native transport 汇总最终 Provider JSON；覆盖结构中的文本字段。','assemble','ASSEMBLE → complete provider JSON'),
          step('最终输入，还要再过一次检查。','按当前披露范围和预算核对实际 JSON 文本，不通过就阻止发送。','检查包含工具与附件字段中的文本；这不等于理解托管图片的像素语义。','inspect','INSPECT → final text checked'),
          step('检查通过的内容，按同份字节发送。','避免检查一份请求、发送另一份重新拼装的内容。','公共传输路径复用同份序列化 bytes；独立 DispatchTicket 原始字节比对仍有边界。','serialize','SERIALIZE → same bytes'),
          step('输入合格，还要具备当前执行权。','发送继续接受来源授权、共享容量和当前执行租约检查。','传输检查不会代授来源权限，也不会绕过容量协调或失效 Worker 限制。','send','SEND → current authority'),
          step('返回后，核对完整输出。','分别记录拒答、截断、结构有效性与业务结论，不能见到响应就判为成功。','完整输出校验复用既有响应链路，结构通过仍不等于事实或业务验收通过。','output','OUTPUT → complete response checked'),
          step('看清覆盖范围，再作出判断。','托管图片的像素含义和独立票据字节审计仍需额外验证。','本版不宣称全面 DLP，也不以文本校验覆盖所有附件语义与独立原始字节证明。','limits','BOUNDARY → explicit coverage'),
        ]),
      ],
      experiment: { title: '超时以后，可以立即重试吗？', copy: '切换为不同观测状态，查看下一步。', type: 'runtime', options: ['远端结果未知', '已确认远端完成', '已确认未发出'] },
      cards: [card('spark','Profile 与能力','让路由依赖实际能力证据和精确配置。','文本、流式、工具、结构化等能力分别探测。'),card('clock','容量与预算','组织共享资源，避免多个请求相互抢占。','同一容量协调器与处理预算共同限制派发。'),card('pulse','用量与费用','看见排队、首内容、请求时长与可获得的 Token 维度。','缺失用量不是零，平台估算不等于供应商账单。'),card('refresh','诊断与恢复','查明未知状态，再决定恢复、补偿或继续。','保留原尝试；恢复绑定精确目标、版本和有界预算。')],
    },
    integrations: {
      headline: ['能力按需连接，', '执行遵循契约。'], intro: '把发现、批准、加载和执行分开。模型、Skill、Tool 与外部 Agent 可以参与工作，同时保留精确版本、权限和真实回执。', tags: ['Skill · Tool', 'MCP · A2A', '版本化接入'], question: '发现了一个工具，距离真正使用还有几步？',
      scenes: [
        scene('tool','Skill 与工具','从能力目录到一次受控工具动作。',[node('discover','发现能力','先查看元数据','search'),node('load','加载精确版本','Skill · Tool · 契约','book'),node('approve','批准与暴露','人工决定 · 当前权限','shield'),node('bind','绑定具体动作','参数摘要 · 原凭证','key'),node('invoke','执行已批准动作','来源 · 实例 · 租约','send'),node('receipt','保存真实回执','结果 · 副作用 · 审计','check')],[
          step('先看能力目录。','按任务发现可用 Skill 与工具，不必把全部内容塞进上下文。','发现与执行分开，元数据本身不授予调用权。','discover','DISCOVER → capability metadata'),
          step('按需读取精确版本。','加载当前任务真正需要的定义与输入契约。','Skill 指令和工具返回文本不能提升为系统安全指令。','load','LOAD → exact contract'),
          step('批准这项能力，也限定它的范围。','工具需明确注册、审核与暴露，动作仍需当次授权。','重新发现若改变契约，旧批准不继续适用。','approve','APPROVE → current exposure'),
          step('把授权绑定到本次动作。','使用精确参数、原凭证和资源来源，不扩大到其他请求。','受控只读示例限定一个 GET 工具；HTTP 方法本身不证明语义只读。','bind','BIND → exact payload'),
          step('执行前再次核验。','按当前权限、实例和执行权调用工具。','有界只读工具回合最多两次模型请求、一次工具调用、零次修复，共享截止时间。','invoke','INVOKE → authorized action'),
          step('用回执说明实际发生了什么。','响应丢失时先查询外部真实状态，再决定恢复。','逻辑去重不能保证任意远端副作用恰好一次。','receipt','RECEIPT → observed result'),
        ]),
        scene('protocol','协议与网关','用一个边界清楚的接入层，连接已有能力。',[node('client','外部 Agent / 客户端','受控身份与接入','plug'),node('version','选择协议版本','MCP / A2A','file'),node('gateway','核对网关契约','Scope · 原凭证','shield'),node('operation','执行支持的操作','限定操作与 Schema','nodes'),node('state','保持任务连续','Task · Artifact · 状态','layers'),node('export','关联观测元数据','已提交 Trace','pulse')],[
          step('接入先建立身份。','客户端进入受控接入路径，不因兼容某协议就获得资源权。','实例凭证、作用域和当前业务授权分别核验。','client','CLIENT → admitted identity'),
          step('明确采用哪个版本。','MCP 与 A2A 各有已覆盖的版本和操作范围。','MCP 2025-06-18 / 2025-11-25 为版本化 Streamable HTTP 适配；2026-07-28 为有界只读子集。','version','VERSION → bounded compatibility'),
          step('协议通过，也要检查业务权限。','网关检查原始凭证、来源和精确请求。','A2A 1.0.1 覆盖有界 HTTP JSON 任务与有限状态 SSE，不外推为全部 SDK 或传输支持。','gateway','GATEWAY → source authority'),
          step('只执行开放的操作。','对支持的操作和输入结构做服务端校验。','后续 MCP 子集覆盖 server/discover、tools/list 与只读 tools/call；订阅、MRTR 等未开放。','operation','OPERATION → supported subset'),
          step('跨边界，继续使用原工作身份。','任务、工件和状态关联起来，避免把每次交互变成孤立对话。','有共同获准数据平面时可用 DB4A2A 引用，否则按 A2A 传输负载或工件。','state','TASK → continuity preserved'),
          step('导出可观测元数据。','按支持的格式关联已提交 Trace，帮助定位调用过程。','OTLP/HTTP JSON 1.9.0 的已提交元数据不包含提示词或回答正文。','export','TRACE → committed metadata'),
        ]),
      ],
      experiment: { title: '重新发现工具后，旧批准还能用吗？', copy: '批准必须与当前契约匹配，发现能力不会自动开启执行。', type: 'integrations', toggles: ['当前契约已获批准', '本次动作已获授权', '原始凭证仍然有效'] },
      cards: [card('book','Skill-first','先发现能力，再加载任务需要的具体内容。','元数据、精确版本与运行权限分开核验。'),card('plug','MCP 与 A2A','通过明确版本和操作范围接入外部能力。','Streamable HTTP、有界 JSON 任务和有限状态 SSE 按契约使用。'),card('nodes','框架运行','按验证过的固定版本连接框架运行环境。','LangGraph 1.2.12、依赖摘要与经验证 Linux rootfs；不等于任意框架托管。'),card('key','签名与分发','验证实际包，再区分接收、确认与激活。','服务端核验归档签名，需要独立信任公钥；摘要不等于签名。')],
    },
    architecture: {
      headline: ['以数据库为底座，', '让运行状态有根。'], intro: '把身份、知识、任务和审计放回权威数据层。共同的业务对象由适配器连接不同底座，检索与安全尊重各数据库的原生差异。', tags: ['Oracle', 'PostgreSQL', 'YashanDB'], question: '从界面到执行，哪一层保存真实状态？',
      scenes: [
        scene('layers','整体架构','点击架构中的节点，查看每层的职责。',[node('entry','人机交互与接入','Dashboard · Portal · API','message'),node('control','平台控制面','身份 · 策略 · 候选 · 任务','shield'),node('runtime','受控执行','Agent · Model · Tool','nodes'),node('adapter','数据库适配器','共同对象 · 原生差异','plug'),node('database','权威数据层','实体 · 修订 · 关系 · 审计','database'),node('projection','检索与投影','关系 · 向量 · 全文 · 图','search')],[
          step('入口服务于人，也服务于 Agent。','Dashboard 管理平台，Portal 面向使用，API 与协议服务接入。','多入口复用服务端授权和业务规则；界面显示不等于获得执行权。','entry','ENTRY → shared service rules'),
          step('控制面管理身份、状态与决定。','组织、资源、任务、审批和发布都可以查到具体对象。','业务对象是权威状态，不能用自然语言总结代替。','control','CONTROL → authoritative decisions'),
          step('模型和工具参与受控工作。','每次执行关联当前授权、来源、尝试与回执。','实际主机隔离条件、凭证、租约与 fencing 决定能否派发。','runtime','RUNTIME → governed execution'),
          step('适配共同目标，也尊重原生差异。','选择底座后，由对应适配器实现业务与权限目标。','进程在导入驱动前固定后端；冲突配置在连接前拒绝。','adapter','ADAPTER → selected backend'),
          step('真实状态，保存在数据库。','身份、知识修订、任务、租约和审计关联起来，进程重启仍有依据。','原生实体与关系保持权威；外部模型不是业务状态数据库。','database','DATABASE → source of truth'),
          step('投影用于检索，不取代原始依据。','关系图、全文与向量为授权数据提供查询视角。','属性图投影可重建，不独立授予权限；属性图与执行图用途不同。','projection','PROJECTION → rebuildable view'),
        ], { layout: 'architecture' }),
        scene('upgrade','安装与升级','把 DBA 准备、迁移、验证和服务切换分开。',[node('choose','选择底座与产品','单次安装 · 单一后端','database'),node('prepare','完成 DBA 准备','独立目标 · 最小权限','shield'),node('install','安装选定依赖','隔离运行环境','box'),node('backup','确认恢复边界','备份 · 归档 · 密钥','layers'),node('migrate','执行版本化迁移','历史 SQL 校验和保留','refresh'),node('verify','独立验证与切换','数据 · 约束 · 授权','check')],[
          step('先选择适用的产品与底座。','社区版一个包提供三种部署选择，每次安装只选择其中之一。','企业版按底座分别交付；跨底座不是修改一个连接串的在线切换。','choose','SELECT → one backend'),
          step('由 DBA 完成需要特权的准备。','准备隔离目标、受限 Owner、身份和检索能力。','运行配置不保留 SYS 或 root 凭证；窄范围状态视图按 DBA 脚本准备。','prepare','DBA → bounded prerequisites'),
          step('依赖与选定后端匹配。','仅安装需要的运行依赖，避免把三套底座一起带进进程。','以正式包 ABI、CPython 3.14 与 x86_64 Linux/glibc 基线核对。','install','INSTALL → selected dependencies'),
          step('修改数据库前，明确能恢复到哪里。','保留业务数据、配置、权限及所需加密材料。','备份校验与实际恢复演练是不同证据，不能互相替代。','backup','RECOVERY → explicit boundary'),
          step('通过迁移推进版本。','保留已应用历史 SQL 和校验和，新增变更进入后续迁移。','升级 journal 与迁移记录支持诊断及有据恢复；结构 diff 不代替真实升级。','migrate','MIGRATE → immutable history'),
          step('验证新状态，再切换服务。','核对数据、约束、授权和应用入口，保留异常与失败记录。','新装与真实升级分别验证；客户版本、规模和恢复条件仍需确认。','verify','VERIFY → data & permissions'),
        ]),
      ],
      experiment: { title: '选择数据库，查看原生实现。', copy: '三种底座遵循共同业务目标，原生权限与检索实现分别核对。', type: 'architecture', options: ['PostgreSQL', 'Oracle', 'YashanDB'] },
      cards: [card('database','数据库保存权威状态','身份、知识、记忆、任务、执行和审计保持关联。','实体与版本是事实源，派生投影可以重建。'),card('search','数据库原生检索','按所选底座实际能力使用关系、向量、全文、标签和图关系。','逻辑目标一致，不表示索引、计划或吞吐相同。'),card('box','清晰的交付选择','社区版三选一部署，企业版按底座交付。','社区版 Apache-2.0；企业版按 BSL-1.1 文件及商业合同使用。'),card('refresh','可验证的演进','从稳定状态出发维护迁移、升级和恢复路径。','历史 SQL 与证据保留；版本一致不授予跨产品迁移许可。')],
    },
  };
  const overview = {
    nodes: [node('human','人提出目标','问题 · 责任 · 验收','user'),node('agent','Agent 组织工作','能力 · 步骤 · 当前权','nodes'),node('source','读取获准依据','知识 · 记忆 · 精确版本','book'),node('execute','受控执行','模型 · 工具 · 协作','spark'),node('receipt','留下真实结果','回执 · 引用 · 审计','check'),node('continue','接续下一次工作','Task · Work · Handoff','refresh')],
    steps: [step('从一个明确目标开始。','人提出问题、指定责任与验收条件。','目标与主体身份关联。','human','01 / GOAL'),step('让 Agent 在当前授权内组织工作。','选择能力和步骤，形成持久任务。','Task、Step 与运行尝试关联。','agent','02 / PLAN'),step('把获准的资料变成依据。','来源、版本和适用时间跟随上下文。','双主体授权与精确来源。','source','03 / CONTEXT'),step('执行前，再核对一次边界。','模型、工具和协作按具体契约参与。','Profile、凭证、租约与预算核验。','execute','04 / EXECUTE'),step('让结果回到实际发生的过程。','回答关联引用，执行留下回执。','结果与业务验收分别记录。','receipt','05 / EVIDENCE'),step('把工作连续性留给下一位。','带着目标、上下文和未决事项继续。','Work 与 Handoff 保留责任和版本。','continue','06 / CONTINUE')],
  };
  const introduction = {
    id: 'introduction', name: '认识川序',
    steps: [{ title: '让智能体运行有序、可信。',
      business: '川序是以数据库为权威状态源的企业 AI Agent 基础设施。',
      technical: '连接身份、知识、任务、协作和执行证据，让团队能够核对谁在负责、依据是什么、工作到了哪一步。',
      active: [], event: 'WELCOME TO CHUANXU' }],
  };
  pages.governance.intro = '从身份与授权，到持续受管工作、业务权限和撤销，明确外部 Agent 接入后的责任。规约要求使用平台能力，服务端校验实际收到的请求。';
  pages.governance.scenes.push(scene('managed-work','注册后的受管工作','注册是起点，知识、记忆、事实与组织管理贯穿每次任务。',[
    node('adopt','纳入可信配置','责任人 · 安全域 · 规则','shield'),node('read','动作前读依据','授权知识 · 自身记忆','book'),
    node('record','检查点记事实','决策 · 验证 · 缺口','file'),node('remember','保存必要记忆','独立私有 · 幂等回读','layers'),
    node('respect','接受组织管理','模型 · 工具 · 审批 · 撤销','lock'),node('finish','按回执交付','完成 · 部分 · 受阻 · 未知','check'),
  ],[
    step('注册之后，把规约接到每次工作里。','运行方须将受管规约纳入可信配置和任务钩子；不能把激活成功当作接入完成。','这是接入方义务。平台约束收到的请求，不能强迫绕过平台的外部进程调用接口。','adopt','ADOPT → trusted operating configuration'),
    step('开始或恢复前，先读已有依据。','使用相关授权知识和自身记忆，核对版本、时间、冲突和任务验收条件。','Agent Bearer 学习目录需要 knowledge.read；完整社区学习资料需可选导入，缺失时报告，不虚构已读。','read','READ → relevant authorized sources'),
    step('在关键节点，记录真实进展。','保留决策、验证、失败、未决问题和下一步，让后续工作可以接续。','复用 Task、Step、Work 和交接回执；自报观察不冒充独立审计或实际执行证明。','record','CHECKPOINT → actual work facts'),
    step('有必要的上下文，及时存为记忆。','无需等用户说记住；按保留规则保存可复用私有记忆，不保存凭据、无关隐私或隐藏推理。','使用独立 Memory 接口和幂等键，写后按家族回读；无需频道，共享内容仍走候选与审核。','remember','MEMORY → private version and readback'),
    step('企业内部接入，就应遵守组织规则。','接受责任人、安全域、模型工具、审批和撤销管理。必需能力缺失时阻断受影响动作并报告。','不得换凭据、换域或新实例绕过；可信运行配置和外部出口控制需由运行方落实，不能仅靠说明文字。','respect','POLICY → obey current organizational authority'),
    step('结束汇报，要给出真实回执。','按验收条件区分完成、部分、受阻和未知，引用工作记录及必要记忆。','入队不等于完成，组装不证明模型已收到；结果未知先核对原幂等键，不能盲目重发写入。','finish','FINISH → evidence-bound outcome'),
  ]));
  const chapterIntroductions = Object.fromEntries(chapters.slice(1).map(chapter => [chapter.id, {
    id: 'chapter-introduction', name: '本页导览',
    steps: [{ title: chapter.name, business: pages[chapter.id].intro,
      technical: `依次介绍：${pages[chapter.id].scenes.map(scene => scene.name).join('、')}。`,
      active: [], event: 'CHAPTER INTRODUCTION' }],
  }]));
  window.CX = { chapters, pages, overview, introduction, chapterIntroductions, version: '5.0.5' };
})();
