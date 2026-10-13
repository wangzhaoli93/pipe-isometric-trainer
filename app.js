(function () {
  'use strict';

  const DIRECTIONS = {
    E: { label: '向东 E+', delta: [1, 0, 0] },
    W: { label: '向西 E−', delta: [-1, 0, 0] },
    N: { label: '向北 N+', delta: [0, 1, 0] },
    S: { label: '向南 N−', delta: [0, -1, 0] },
    U: { label: '上升 EL+', delta: [0, 0, 1] },
    D: { label: '下降 EL−', delta: [0, 0, -1] },
    XYZ: { label: '自定义 ΔXYZ', delta: null }
  };

  const presets = {
    rise: {
      start: [0, 0, 0], dn: 100,
      segments: [
        { dir: 'E', length: 1200 },
        { dir: 'U', length: 800 },
        { dir: 'N', length: 900 },
        { dir: 'E', length: 700 }
      ]
    },
    offset: {
      start: [0, 0, 300], dn: 80,
      segments: [
        { dir: 'N', length: 1000 },
        { dir: 'E', length: 650 },
        { dir: 'N', length: 850 },
        { dir: 'W', length: 350 }
      ]
    },
    rolling: {
      start: [0, 0, 200], dn: 150,
      segments: [
        { dir: 'E', length: 900 },
        { dir: 'XYZ', dx: 600, dy: 500, dz: 450 },
        { dir: 'N', length: 800 },
        { dir: 'D', length: 300 }
      ]
    },
    equipment: {
      start: [-500, -300, 650], dn: 125,
      segments: [
        { dir: 'E', length: 900 },
        { dir: 'D', length: 450 },
        { dir: 'N', length: 700 },
        { dir: 'E', length: 850 },
        { dir: 'U', length: 500 }
      ]
    },
    classicZ: {
      start: [500, 500, 400], dn: 100,
      segments: [
        { dir: 'E', length: 700 },
        { dir: 'XYZ', dx: 500, dy: 400, dz: 350 },
        { dir: 'E', length: 900 },
        { dir: 'XYZ', dx: 500, dy: -400, dz: -350 },
        { dir: 'E', length: 700 }
      ]
    },
    advanced: {
      start: [1200, 800, 500], dn: 150,
      segments: [
        { dir: 'E', length: 1000 },
        { dir: 'U', length: 600 },
        { dir: 'N', length: 750 },
        { dir: 'XYZ', dx: 500, dy: 400, dz: 300 },
        { dir: 'W', length: 300 },
        { dir: 'D', length: 450 }
      ]
    },
    diag45: {
      start: [0, 0, 300], dn: 100,
      segments: [
        { dir: 'E', length: 600 },
        { dir: 'XYZ', dx: 500, dy: 500, dz: 0 },
        { dir: 'E', length: 800 },
        { dir: 'XYZ', dx: 500, dy: -500, dz: 0 },
        { dir: 'E', length: 600 }
      ]
    },
    overpass: {
      start: [0, 0, 200], dn: 150,
      segments: [
        { dir: 'E', length: 800 },
        { dir: 'U', length: 600 },
        { dir: 'E', length: 1200 },
        { dir: 'D', length: 600 },
        { dir: 'E', length: 800 }
      ]
    },
    expansion: {
      start: [0, 0, 300], dn: 200,
      segments: [
        { dir: 'E', length: 1000 },
        { dir: 'N', length: 900 },
        { dir: 'W', length: 700 },
        { dir: 'S', length: 900 },
        { dir: 'E', length: 1200 }
      ]
    },
    slopeDrain: {
      start: [1000, 1000, 2000], dn: 80,
      segments: [
        { dir: 'XYZ', dx: 1500, dy: 0, dz: -30 },
        { dir: 'N', length: 600 },
        { dir: 'XYZ', dx: 900, dy: 0, dz: -18 },
        { dir: 'D', length: 250 }
      ]
    },
    serpent: {
      start: [0, 0, 0], dn: 125,
      segments: [
        { dir: 'N', length: 600 },
        { dir: 'U', length: 450 },
        { dir: 'E', length: 700 },
        { dir: 'XYZ', dx: 400, dy: -300, dz: 250 },
        { dir: 'S', length: 500 },
        { dir: 'D', length: 400 },
        { dir: 'W', length: 300 }
      ]
    },
    doubleNozzle: {
      start: [-500, 0, 450], dn: 100,
      segments: [
        { dir: 'E', length: 500 },
        { dir: 'U', length: 700 },
        { dir: 'N', length: 900 },
        { dir: 'E', length: 800 },
        { dir: 'D', length: 400 },
        { dir: 'S', length: 500 },
        { dir: 'E', length: 600 },
        { dir: 'D', length: 300 }
      ]
    }
  };

  const presetTitles = {
    rise: '立管转向', offset: '平面绕行', rolling: '空间偏移', equipment: '设备接管', classicZ: '立体Z形偏移', advanced: '改造闭合',
    diag45: '45°双偏移', overpass: '翻越障碍', expansion: 'Π形膨胀回路', slopeDrain: '连续坡度排液', serpent: '多平面蛇形管', doubleNozzle: '设备双口跨接'
  };

  const trainingTracks = {
    petroleum: {
      code: 'OIL',
      title: '石油管线',
      short: '输送与站场',
      summary: '面向原油、成品油和站场工艺管线，重点训练管线等级、清管条件、防腐保护、线路接口与投运前检查。',
      workflow: [
        ['识图', '线路、站场与接口'],
        ['验料', '钢管、防腐与追溯'],
        ['安装', '组对、下沟或架设'],
        ['交接', '试压、清管与恢复']
      ],
      lessons: [
        {
          id: 'oil-drawings', stage: '01 · 图纸与系统', title: '线路、站场与管线号',
          focus: '先确认这段管线属于线路还是站场，再沿介质流向找到阀室、清管设施、排气排液和等级分界。',
          steps: ['对照 P&ID、线路走向图、站场布置图和单线图', '拆读管线号中的介质、管径、等级与保温信息', '沿流向确认起点、终点、阀门和清管器通道', '识别 Tie-in、等级分界和施工界面'],
          checks: ['图纸版本与现场受控版本一致', '管线号、流向和阀门位号能互相对应', '清管管线内径没有明显阻挡', '任何不一致先提问，不凭经验改图']
        },
        {
          id: 'oil-material', stage: '02 · 材料与防腐', title: '钢管、防腐层与材料追溯',
          focus: '材料牌号、炉批号和防腐状态必须可追溯，吊运和安装过程中不能把合格防腐层变成隐患。',
          steps: ['核对钢管、管件、阀门和法兰的等级及标识', '认识炉批号、材质证明和现场色标的作用', '检查外防腐层、管端保护和绝缘部件', '了解阴极保护测试点及绝缘接头的施工边界'],
          checks: ['材料等级不能只看外形判断', '防腐破损先标识并按批准程序修补', '吊带和支点不得继续损伤防腐层', '坡口、密封面和管内保持清洁']
        },
        {
          id: 'oil-install', stage: '03 · 线路安装', title: '组对、穿越与站场安装',
          focus: '把线路坐标、弯管方向、埋深或支架标高与站场接口统一起来，避免最后一个接口靠硬拉解决。',
          steps: ['按控制点复核中心线、转角点和标高', '确认弯管方向、穿越段和阀门操作方向', '安排合理的组对、焊接与接口顺序', '控制临时支撑、下沟或吊装过程中的变形'],
          checks: ['设备口和固定口不得强力组对', '吊装前确认重量、重心、吊点和通道', '阀门与清管设施保留操作维护空间', '回填或封闭前完成规定检查记录']
        },
        {
          id: 'oil-turnover', stage: '04 · 试验与投运', title: '试压、清管与恢复',
          focus: '按试压包和批准方案确认边界、排气排水、警戒、清管及最终恢复，不能把临时件遗留在系统中。',
          steps: ['核对试压包边界、盲板、仪表和放空排液点', '理解充水、排气、升压、保压和泄压的顺序', '确认清管、测径、排水和干燥的项目要求', '按盲板表和阀门状态完成系统恢复'],
          checks: ['试验压力与范围以批准文件为准', '带压期间不得处理泄漏或敲击管线', '清管器前方和排放区域必须隔离', '恢复后逐项销项并保留记录']
        }
      ],
      quiz: [
        { q: '钢管吊运后发现外防腐层有一道划伤，下一步最合适的做法是什么？', a: ['马上下沟，用土覆盖', '标识并上报，按批准程序修补和复检', '涂一点普通油漆即可', '只要钢管没变形就继续安装'], correct: 1, why: '防腐层属于管线完整性的一部分，破损需要按项目程序修补并确认合格后再进入下一工序。' },
        { q: '准备安装一段需要通过清管器的管线，最先应重点确认什么？', a: ['管线外观颜色是否统一', '所有阀门手轮朝向相同', '内径通道、弯头和阀门是否允许清管器通过', '支架是否全部刷完面漆'], correct: 2, why: '清管管线必须保持连续可通过的内径，弯曲半径、阀门结构和内部障碍都需要核对。' },
        { q: '旧系统 Tie-in 接口准备切开前，管工可以只凭压力表为零就开始吗？', a: ['可以，压力表为零就安全', '可以，先切一个小口试试', '不可以，必须执行许可证、隔离、泄压排净及气体检测要求', '只要戴好面罩就可以'], correct: 2, why: '压力表为零不能证明介质已经完全隔离。必须按作业许可和隔离确认程序执行。' }
      ]
    },
    chemical: {
      code: 'CHEM',
      title: '化工管线',
      short: '介质与洁净控制',
      summary: '面向腐蚀、有毒、易燃和高纯介质管线，重点训练介质相容性、死角控制、伴热夹套、清洁隔离与恢复确认。',
      workflow: [
        ['辨介质', '危害与材料等级'],
        ['控方向', '坡度、排净与放空'],
        ['做安装', '洁净、伴热与衬里'],
        ['验系统', '清洗、试漏与恢复']
      ],
      lessons: [
        {
          id: 'chem-class', stage: '01 · 介质与等级', title: '介质危害和管道等级',
          focus: '化工管线不能只按尺寸配件，必须同时确认介质、温压、材料、垫片和清洁等级。',
          steps: ['从 P&ID 和管线号确认介质、流向及设计条件', '对照管道等级表确认管材、管件、法兰、垫片和紧固件', '理解腐蚀、毒性、易燃性和污染风险', '识别材料边界和不同系统之间的隔离点'],
          checks: ['同尺寸不代表同等级可以互换', '垫片和阀门内件要与介质相容', '材料标识不清时先隔离待确认', '拆开旧系统前确认残余介质风险']
        },
        {
          id: 'chem-layout', stage: '02 · 布置与排净', title: '坡度、死角、排气与排液',
          focus: '通过坡度、低点排液和高点放空让系统能够排净、置换和维护，减少积液与残留。',
          steps: ['结合流向和标高识别高点与低点', '按图确认坡度方向和连续性', '识别排气、排液、取样和冲洗接口', '检查阀门安装后是否形成新的积液点或死角'],
          checks: ['偏心大小头方向必须按图核对', '支架调整不能破坏设计坡度', '排放去向不能凭方便临时决定', '保留阀门操作和拆卸空间']
        },
        {
          id: 'chem-special', stage: '03 · 特殊结构', title: '伴热、夹套、衬里与洁净安装',
          focus: '特殊管线的关键是保护内部表面和系统边界，安装顺序要服从清洁、检验和可维护性。',
          steps: ['区分蒸汽伴热、电伴热和夹套管的基本结构', '认识衬里管、塑料管和高洁净管的保护要求', '按项目规定进行封口、清洁和工具隔离', '安排内管、夹套、疏水和检验接口的施工顺序'],
          checks: ['衬里密封面不得划伤或强行找正', '洁净管端不应长时间敞口', '伴热走向不能妨碍阀门检修', '特殊介质不得擅自混用清洗材料']
        },
        {
          id: 'chem-turnover', stage: '04 · 清洗与恢复', title: '置换、清洗、试漏和交接',
          focus: '试验合格不等于可以投用，还要确认清洗介质、干燥程度、阀门状态和临时件恢复。',
          steps: ['按方案确定冲洗、吹扫、化学清洗或钝化边界', '核对盲板、过滤器、仪表和敏感设备的隔离措施', '理解泄漏试验、气密试验和干燥记录的作用', '完成阀门状态、临时短管和盲板的最终恢复'],
          checks: ['不同介质系统不能交叉污染', '排放和废液处置按现场规定执行', '未经批准不得用氧气吹扫', '交接前确认标识、流向和隔离状态']
        }
      ],
      quiz: [
        { q: '仓库里找到一个尺寸完全相同的垫片，但材质与管道等级表不一致，可以临时使用吗？', a: ['可以，尺寸相同即可', '可以，螺栓拧紧一点', '不可以，隔离并按等级表确认正确材质', '先装上，试压漏了再换'], correct: 2, why: '化工介质对垫片相容性敏感，尺寸相同不能替代材料和压力等级要求。' },
        { q: '拆开一段停运化学品管线时，法兰处仍有少量液体流出，应该怎么做？', a: ['继续拆，流完就行', '用抹布堵住', '立即停止，重新确认隔离、排净、置换和检测', '让旁边的人接住液体'], correct: 2, why: '残液说明系统状态没有被可靠确认，应停止并回到隔离和作业许可流程。' },
        { q: '安装有设计坡度的管线时，支架调整后出现局部反坡，最正确的处理是什么？', a: ['不影响，外观看不出来', '在低点临时打孔排液', '按图复测并调整支架或管段，恢复连续坡度', '把坡度标注擦掉'], correct: 2, why: '局部反坡会形成积液点，应通过复测和合规调整恢复设计坡度。' }
      ]
    },
    module: {
      code: 'MOD',
      title: '模块化施工',
      short: '吊装与接口管理',
      summary: '面向工艺模块、管廊模块和成套装置，重点训练坐标基准、运输分段、临时加固、整体吊装、模块就位和接口闭合。',
      workflow: [
        ['建基准', '轴网、坐标与界面'],
        ['做模块', '预装与运输加固'],
        ['吊就位', '重心、吊点与找正'],
        ['闭接口', 'Tie-in 与尾项交接']
      ],
      lessons: [
        {
          id: 'mod-grid', stage: '01 · 基准与界面', title: '模块轴网、坐标和接口点',
          focus: '模块内部尺寸合格还不够，必须与基础、相邻模块和现场接口使用同一套基准。',
          steps: ['识别模块号、轴网、基准点和坐标方向', '核对模块边界、运输分段和现场接口点', '将设备、管道、结构和电仪界面叠加检查', '建立接口点复测和问题清单'],
          checks: ['测量基准来源明确且受控', '图纸版本在各专业之间一致', '接口坐标同时核对 E、N、EL', '预留口有可靠封堵和清晰标识']
        },
        {
          id: 'mod-fabrication', stage: '02 · 模块预装', title: '预装顺序和运输状态',
          focus: '按运输和安装条件决定哪些管线厂内完成、哪些留现场口，并保护运输过程中可能变形的部位。',
          steps: ['按安装可达性安排设备、主管和支管顺序', '识别运输拆分件、现场焊口和临时短管', '设置运输支撑、临时加固和管口保护', '记录模块出厂前尺寸、重量和重心状态'],
          checks: ['运输加固不得代替永久支架', '阀门、仪表和法兰面得到保护', '突出模块边界的部件防碰撞', '散件和拆分件编号与清单一致']
        },
        {
          id: 'mod-lift', stage: '03 · 吊装与就位', title: '重心、吊点和模块找正',
          focus: '模块吊装按批准吊装方案执行，管工负责确认管线和接口不会因吊装状态受到损伤。',
          steps: ['理解重量、重心、吊点和吊装姿态的关系', '吊前检查松散件、临时加固和管口封闭', '就位后复核标高、水平、轴线和垫板状态', '永久固定达到要求后再按程序拆临时件'],
          checks: ['只使用方案指定且验收合格的吊点', '任何人不得进入吊物下方', '风况、通道和障碍物满足方案要求', '临时支撑拆除必须有明确授权']
        },
        {
          id: 'mod-tiein', stage: '04 · 接口与交接', title: '模块接口闭合和尾项',
          focus: '接口误差先测量、分类和技术确认，再决定闭合管段，不能把累积误差强加到设备口。',
          steps: ['复测相邻模块和外部管廊接口的三维坐标', '识别 Closure Spool、现场焊口和调整余量', '按系统完成接口焊接、检验和支架恢复', '清理尾项、临时件、保护件和模块边界'],
          checks: ['接口错位先查基准和图纸版本', '设备管口不得承受强制位移', '闭合前确认阀门与仪表可维护', 'Punch 项逐条关闭并留记录']
        }
      ],
      quiz: [
        { q: '模块就位后，管线接口横向错开25毫米，现场首先应该怎么做？', a: ['用倒链把接口硬拉到一起', '切开设备口重新焊', '复测基准、坐标和图纸版本，提交接口偏差处理', '把螺栓强行穿进去'], correct: 2, why: '模块接口偏差可能来自基准、安装或累积误差，必须先查明来源并取得技术处理方案。' },
        { q: '模块已经落位，运输临时支撑是否可以立即全部拆除？', a: ['可以，落位就没用了', '不可以，要确认永久固定和拆除程序已满足', '可以，只要不影响美观', '让任何一名工人决定即可'], correct: 1, why: '临时支撑承担运输或安装阶段稳定作用，应在永久固定完成并获得授权后按程序拆除。' },
        { q: '吊装前发现一个管口保护盖松动，正确处理是什么？', a: ['不管，起吊后再说', '用手扶着一起吊', '停止该项准备，重新固定并纳入吊前检查', '把保护盖扔掉'], correct: 2, why: '松散件可能成为坠物并污染管内，必须在起吊前处理。' }
      ]
    },
    prefab: {
      code: 'FAB',
      title: '管道预制',
      short: '下料与组对',
      summary: '面向预制场和现场预制，重点训练 Spool 图拆读、材料领用、管件扣除、切割坡口、法兰组对、焊口追踪和成品保护。',
      workflow: [
        ['拆图', 'Spool 与材料表'],
        ['下料', '尺寸、扣除与坡口'],
        ['组对', '方向、法兰与焊口'],
        ['放行', '检验、标识与运输']
      ],
      lessons: [
        {
          id: 'fab-spool', stage: '01 · 拆图与领料', title: 'Spool 图、焊口和材料表',
          focus: '先把一张 Spool 图拆成管段、管件、法兰和焊口，再按材料等级领料和建立追踪。',
          steps: ['读取 Spool 号、管线号、方向、标高和接口', '区分预制焊口、现场焊口和拆分位置', '按 MTO/BOM 清点管材、管件、法兰和紧固件', '将材料标识和炉批号转移到可追溯记录'],
          checks: ['图纸版本和材料表一致', '同规格不同等级分区摆放', '领料后仍能识别材料来源', '预制前确认现场口和安装方向']
        },
        {
          id: 'fab-cut', stage: '02 · 计算与加工', title: '下料尺寸、管件扣除和坡口',
          focus: '图纸中心线尺寸不能直接当成直管下料长，需要扣除管件中心至端面尺寸并考虑组对要求。',
          steps: ['从中心线尺寸拆出每段直管的理论长度', '按实际管件尺寸计算弯头、三通和法兰扣除', '划线、复核后切割并加工规定坡口', '清除毛刺、异物并复测成品长度'],
          checks: ['先量实物管件再批量下料', '坡口形式和间隙按 WPS 或工艺卡', '切割面不能影响后续组对', '不确定的调整量留在指定现场口']
        },
        {
          id: 'fab-fitup', stage: '03 · 组对与方向', title: '法兰孔位、支管和焊口组对',
          focus: '预制尺寸正确还要方向正确，尤其注意法兰孔跨中、支管旋转角、阀门方向和空间偏移。',
          steps: ['在平台上建立中心线、垂直线和方向基准', '按图定位支管、弯头平面和空间旋转角', '检查法兰密封面、孔位和配对方向', '测量根部间隙、错边和整体尺寸并记录'],
          checks: ['法兰孔位按图和项目约定确认', '不能用焊接收缩代替错误尺寸', '点固后再次复核所有方向', '不合格组对在正式焊接前纠正']
        },
        {
          id: 'fab-release', stage: '04 · 检验与保护', title: '焊口追踪、放行和运输保护',
          focus: '一件 Spool 从组对到出场都应能对应图纸、焊口、检验状态和材料身份。',
          steps: ['标记 Spool 号、管线号、方向和现场接口', '维护焊口图、焊工号及 NDT 状态', '完成尺寸、清洁度和表面状态检查', '封口、保护法兰面并设计可靠运输支点'],
          checks: ['未放行焊口不能混入合格区', '法兰密封面和管内清洁得到保护', '运输支点避免细长管段变形', '到场后按清单复验和交接']
        }
      ],
      quiz: [
        { q: '单线图给出的是弯头中心到法兰面的尺寸，下料时能直接把这个尺寸当直管长度吗？', a: ['能，图纸尺寸就是下料长度', '不能，要扣除管件中心至端面的实际尺寸', '能，多出来的现场磨掉', '只要管径小就能'], correct: 1, why: '中心线尺寸通常包含管件占用，需要根据实际管件尺寸和组对要求计算直管下料长度。' },
        { q: '法兰点固后发现螺栓孔方向不符合图纸，最合适的处理是什么？', a: ['继续焊，现场扩孔', '正式焊接前解除点固并重新找正', '用更细的螺栓', '把配对法兰也转一个角度'], correct: 1, why: '方向错误应在正式焊接前纠正，不能通过扩孔或改变其他合格部件来掩盖。' },
        { q: '同规格两根管子放在一起，其中一根材料标识已经看不清，应该怎么办？', a: ['随便选一根使用', '凭颜色和重量判断', '隔离待确认，恢复可追溯性后再使用', '用在压力低的地方'], correct: 2, why: '材料身份不清就失去可追溯性，必须隔离并按项目程序确认。' }
      ]
    },
    retrofit: {
      code: 'MOD+',
      title: '改造与切割',
      short: '实测与闭合',
      summary: '面向装置检修和旧管改造，重点训练受控开管、现状测量、切割边界、临时支撑、闭合管段和系统恢复。',
      workflow: [
        ['查系统', '介质、隔离与图纸'],
        ['量现状', '坐标、壁厚与接口'],
        ['做切改', '支撑、切割与预制'],
        ['闭系统', '检验、试验与恢复']
      ],
      lessons: [
        {
          id: 'retro-isolation', stage: '01 · 开管前确认', title: '介质隔离与受控开管',
          focus: '切割旧管之前先证明系统已经与危险能量和介质可靠隔离，压力表归零不能代替隔离确认。',
          steps: ['核对系统、介质、流向和改造边界', '执行作业许可证、LOTO、盲板或项目规定的隔离方式', '确认泄压、排净、置换、气体检测和残液去向', '在批准的第一开口位置进行受控开管'],
          checks: ['隔离点和盲板表与现场一致', '单个关闭阀不被默认当成绝对隔离', '动火和冷切割使用各自批准程序', '异常气味、液体或压力立即停工撤离']
        },
        {
          id: 'retro-survey', stage: '02 · 现状实测', title: '旧管测量与新旧图对比',
          focus: '旧图只能作为线索，改造下料必须建立在现场坐标、壁厚、椭圆度、支撑和真实接口状态上。',
          steps: ['确认基准点并实测两端 E、N、EL 和中心线', '记录管径、壁厚、材质标识、腐蚀和焊缝位置', '检查法兰孔位、阀门方向、支架和拆装空间', '把实测 As-built 与新设计叠加形成偏差清单'],
          checks: ['至少复核一次关键尺寸和基准', '保留现场口调整量但不擅自改变设计', '疑似减薄或裂纹交由检验人员评定', '新旧材料及压力等级边界清楚']
        },
        {
          id: 'retro-cut', stage: '03 · 切割与临时状态', title: '切割线、临时支撑和端口保护',
          focus: '切掉旧管会改变重量路径和约束状态，切割计划必须同时考虑残余应力、坠落、夹持和后续组对。',
          steps: ['按批准图纸标出切割线、保留段和现场焊口', '切割前设置并验收临时支撑和吊点', '选择允许的冷切或热切方法并控制火花、烟尘和切屑', '切后保护坡口、管内和相邻设备并重新测量接口'],
          checks: ['不得站在可能回弹或坠落的受力方向', '夹具不能损伤仍需保留的管段', '切屑和熔渣不能进入设备或洁净系统', '发现管段移动说明受力状态变化，应立即停工']
        },
        {
          id: 'retro-close', stage: '04 · 闭合与恢复', title: 'Closure Spool、检验和系统恢复',
          focus: '闭合管段按最终实测尺寸制作，安装时不能用外力把偏差传给设备口，完成后逐项恢复系统边界。',
          steps: ['用最终接口坐标计算闭合管段并复核方向', '按材料等级、WPS和检验计划完成预制组对', '按批准顺序安装现场焊口、支架和阀门', '完成 NDT、试验、盲板恢复、标识和资料更新'],
          checks: ['闭合前再次确认图纸版本和接口状态', '不得靠硬拉或加热强制对口', '临时支撑拆除经过确认并留记录', '更新竣工图、焊口图和改造记录']
        }
      ],
      quiz: [
        { q: '旧管压力表显示为零，现场是否可以直接开始切割？', a: ['可以，零压就没有危险', '不可以，仍要按许可确认隔离、排净、置换和检测', '可以先割一个小孔试试', '只要使用冷切割就可以'], correct: 1, why: '零压不能证明危险介质和能量已经可靠隔离，受控开管前必须完成项目规定的隔离确认。' },
        { q: '切开第一道口后，保留管段突然移动了几毫米，下一步应怎么做？', a: ['继续切，移动量不大', '用脚踩住继续施工', '立即停止并重新评估残余应力、支撑和吊点', '把管段拉回原位焊住'], correct: 2, why: '管段移动说明原系统存在载荷或残余应力，继续切割可能造成夹伤、坠落或接口损坏。' },
        { q: '新闭合管段与设备法兰差10毫米，最合适的做法是什么？', a: ['用倒链把设备口拉过来', '加厚垫片补齐', '复测并按批准程序调整闭合管段或处理偏差', '强行穿螺栓'], correct: 2, why: '设备口不能承受强制组对载荷，应复核测量和加工尺寸并取得技术处理方案。' }
      ]
    }
  };

  let state = JSON.parse(JSON.stringify(presets.rise));
  let activePreset = 'rise';
  let selectedSegment = 0;
  let quizActive = false;
  let activeTrainingTrack = 'petroleum';
  let activeTrainingLesson = trainingTracks.petroleum.lessons[0].id;
  let activeScenario = 0;
  let scenarioAnswered = false;
  let selectedScenarioAnswer = null;
  let completedTrainingLessons = new Set();
  let manualLandscapeMode = false;
  let dataPanelVisible = true;
  let drawingPanelVisible = true;
  let learnerProfiles = [];
  let activeProfileId = '';
  let favoritePresets = new Set();
  let wrongQuestionRecords = [];
  let activeCaseFilter = 'all';
  let lastFocusedNumericInput = null;
  let quickCalcAngleMode = 'DEG';
  let quickCalcLastResult = null;
  let quickCalcHistory = [];
  let quickCalcParser = null;

  const els = {
    list: document.getElementById('segmentList'),
    startE: document.getElementById('startE'),
    startN: document.getElementById('startN'),
    startZ: document.getElementById('startZ'),
    pipeDn: document.getElementById('pipeDn'),
    isoSvg: document.getElementById('isoSvg'),
    coordTable: document.getElementById('coordTableBody'),
    startCoord: document.getElementById('startCoordText'),
    endCoord: document.getElementById('endCoordText'),
    labels: document.getElementById('coordLabels'),
    viewport: document.getElementById('threeViewport'),
    selectedLabel: document.getElementById('selectedStepLabel'),
    selectedValue: document.getElementById('selectedStepValue'),
    quizCover: document.getElementById('quizCover'),
    quizMessage: document.getElementById('quizMessage')
  };

  // 可视化配置常量
  const VISUAL_CONFIG = {
    pipe: { minRadius: 0.035, maxRadius: 0.12, dnScale: 1600, segments: 20 },
    joint: { radiusScale: 1.13, segments: 18, rings: 14 },
    shadow: { opacity: 0.65, dashSize: 0.12, gapSize: 0.08, yOffset: 0.015 },
    dropLine: { opacity: 0.55, dashSize: 0.08, gapSize: 0.06 },
    colors: {
      selected: 0xd46b2a,
      normal: 0x146b8c,
      jointSelected: 0xd46b2a,
      jointNormal: 0xe8edef,
      shadow: 0x68757d,
      dropLine: 0xa4adb2
    }
  };

  // 渲染状态管理
  let needsRender = true;
  let renderScheduled = false;

  function markDirty() {
    needsRender = true;
    if (!renderScheduled) {
      renderScheduled = true;
      requestAnimationFrame(() => {
        renderScheduled = false;
        if (needsRender) {
          needsRender = false;
          renderer.render(scene, camera);
        }
      });
    }
  }

  // 几何体缓存
  const geometryCache = {
    cylinders: new Map(),
    spheres: new Map(),
    getCylinder(radius, length) {
      const key = `${radius.toFixed(4)}_${length.toFixed(4)}`;
      if (!this.cylinders.has(key)) {
        this.cylinders.set(key, new THREE.CylinderGeometry(radius, radius, length, VISUAL_CONFIG.pipe.segments));
      }
      return this.cylinders.get(key);
    },
    getSphere(radius) {
      const key = radius.toFixed(4);
      if (!this.spheres.has(key)) {
        this.spheres.set(key, new THREE.SphereGeometry(radius, VISUAL_CONFIG.joint.segments, VISUAL_CONFIG.joint.rings));
      }
      return this.spheres.get(key);
    },
    clear() {
      this.cylinders.forEach(g => g.dispose());
      this.spheres.forEach(g => g.dispose());
      this.cylinders.clear();
      this.spheres.clear();
    }
  };

  // 材质缓存
  const materialCache = {
    pipes: {},
    joints: {},
    getPipeMaterial(isSelected) {
      const key = isSelected ? 'selected' : 'normal';
      if (!this.pipes[key]) {
        this.pipes[key] = new THREE.MeshStandardMaterial({
          color: isSelected ? VISUAL_CONFIG.colors.selected : VISUAL_CONFIG.colors.normal,
          roughness: 0.48,
          metalness: 0.08
        });
      }
      return this.pipes[key];
    },
    getJointMaterial(isSelected) {
      const key = isSelected ? 'selected' : 'normal';
      if (!this.joints[key]) {
        this.joints[key] = new THREE.MeshStandardMaterial({
          color: isSelected ? VISUAL_CONFIG.colors.jointSelected : VISUAL_CONFIG.colors.jointNormal,
          roughness: 0.45,
          metalness: 0.08
        });
      }
      return this.joints[key];
    }
  };

  // 缓存的 DOM 元素
  const cachedElements = {};

  function getCachedElement(id) {
    if (!cachedElements[id]) {
      cachedElements[id] = document.getElementById(id);
    }
    return cachedElements[id];
  }

  let scene, camera, renderer, controls, pipeGroup, shadowGroup, grid, raycaster, pointer;
  let pipeMeshes = [];
  let pointVectors = [];
  let currentView = 'iso';

  function n(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function fmt(value) {
    return Math.round(value).toLocaleString('zh-CN');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function copyPreset(name) {
    return JSON.parse(JSON.stringify(presets[name]));
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value === null ? fallback : value;
    } catch (error) {
      console.warn(`读取 localStorage 键 "${key}" 失败:`, error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn(`localStorage 存储空间已满，无法保存键 "${key}"。请清理旧数据。`);
      } else {
        console.warn(`写入 localStorage 键 "${key}" 失败:`, error);
      }
      return false;
    }
  }

  function profileKey(base, profileId = activeProfileId) {
    return `${base}:${profileId}`;
  }

  function initProfileCore() {
    learnerProfiles = readJson('pipe-learner-profiles', []);
    if (!Array.isArray(learnerProfiles) || learnerProfiles.length === 0) {
      learnerProfiles = [{ id: 'default', name: '我的学习', createdAt: new Date().toISOString() }];
      writeJson('pipe-learner-profiles', learnerProfiles);
    }
    activeProfileId = localStorage.getItem('pipe-active-profile') || learnerProfiles[0].id;
    if (!learnerProfiles.some((profile) => profile.id === activeProfileId)) activeProfileId = learnerProfiles[0].id;
    localStorage.setItem('pipe-active-profile', activeProfileId);

    const migrations = ['pipe-route-progress', 'pipe-module-progress'];
    migrations.forEach((base) => {
      if (localStorage.getItem(profileKey(base)) === null && localStorage.getItem(base) !== null) {
        localStorage.setItem(profileKey(base), localStorage.getItem(base));
      }
    });
    loadProfileVariables();
  }

  function loadProfileVariables() {
    favoritePresets = new Set(readJson(profileKey('pipe-favorite-presets'), []));
    wrongQuestionRecords = readJson(profileKey('pipe-wrong-questions'), []);
    if (!Array.isArray(wrongQuestionRecords)) wrongQuestionRecords = [];
    quickCalcHistory = readJson(profileKey('pipe-quick-history'), []);
    if (!Array.isArray(quickCalcHistory)) quickCalcHistory = [];
  }

  function saveFavoritePresets() {
    writeJson(profileKey('pipe-favorite-presets'), Array.from(favoritePresets));
  }

  function recordWrongQuestion(id, label, destination = 'modules') {
    if (!wrongQuestionRecords.some((item) => item.id === id)) {
      wrongQuestionRecords.unshift({ id, label, destination, time: new Date().toISOString() });
      wrongQuestionRecords = wrongQuestionRecords.slice(0, 50);
      writeJson(profileKey('pipe-wrong-questions'), wrongQuestionRecords);
      renderProfilePage();
    }
  }

  function getPoints() {
    const points = [{ e: state.start[0], n: state.start[1], z: state.start[2] }];
    state.segments.forEach((segment) => {
      const prev = points[points.length - 1];
      if (segment.dir === 'XYZ') {
        points.push({ e: prev.e + n(segment.dx), n: prev.n + n(segment.dy), z: prev.z + n(segment.dz) });
      } else {
        const d = DIRECTIONS[segment.dir].delta;
        const len = n(segment.length);
        points.push({ e: prev.e + d[0] * len, n: prev.n + d[1] * len, z: prev.z + d[2] * len });
      }
    });
    return points;
  }

  function segmentText(segment) {
    if (segment.dir === 'XYZ') return `ΔE ${fmt(segment.dx)} · ΔN ${fmt(segment.dy)} · ΔEL ${fmt(segment.dz)} mm`;
    return `${DIRECTIONS[segment.dir].label.replace(/[ENL+−]/g, '').trim()} ${fmt(segment.length)} mm`;
  }

  function syncHeaderInputs() {
    els.startE.value = state.start[0];
    els.startN.value = state.start[1];
    els.startZ.value = state.start[2];
    els.pipeDn.value = state.dn;
  }

  function renderSegments() {
    const points = getPoints();
    els.list.innerHTML = '';
    state.segments.forEach((segment, index) => {
      const row = document.createElement('div');
      row.className = `segment-row${index === selectedSegment ? ' is-selected' : ''}`;
      row.dataset.index = index;
      const options = Object.entries(DIRECTIONS).map(([key, item]) => `<option value="${key}"${key === segment.dir ? ' selected' : ''}>${item.label}</option>`).join('');
      const custom = segment.dir === 'XYZ'
        ? `<div class="custom-delta">
             <label>ΔE<input type="number" data-field="dx" step="50" value="${n(segment.dx)}"></label>
             <label>ΔN<input type="number" data-field="dy" step="50" value="${n(segment.dy)}"></label>
             <label>ΔEL<input type="number" data-field="dz" step="50" value="${n(segment.dz)}"></label>
           </div>`
        : `<div class="segment-main single"><label>长度 mm<input type="number" data-field="length" min="1" step="50" value="${n(segment.length, 500)}"></label></div>`;
      row.innerHTML = `<div class="segment-top"><span class="segment-index">${String(index + 1).padStart(2, '0')}</span><select data-field="dir" aria-label="第${index + 1}段方向">${options}</select><button class="delete-btn" type="button" title="删除本段" aria-label="删除第${index + 1}段">×</button></div>${custom}<div class="segment-result">终点 P${index + 1}：E ${fmt(points[index + 1].e)} · N ${fmt(points[index + 1].n)} · EL ${fmt(points[index + 1].z)}</div>`;
      row.addEventListener('click', () => selectSegment(index));
      row.querySelectorAll('select, input').forEach((control) => {
        control.addEventListener('click', (event) => event.stopPropagation());
        control.addEventListener('change', () => {
          const field = control.dataset.field;
          if (field === 'dir') {
            segment.dir = control.value;
            if (segment.dir === 'XYZ') Object.assign(segment, { dx: 500, dy: 500, dz: 500 });
            else segment.length = n(segment.length, 500);
          } else segment[field] = n(control.value);
          quizActive = false;
          updateAll();
        });
        control.addEventListener('input', () => {
          const field = control.dataset.field;
          if (field !== 'dir') {
            segment[field] = n(control.value);
            quizActive = false;
            updateVisualsOnly();
          }
        });
      });
      row.querySelector('.delete-btn').addEventListener('click', (event) => {
        event.stopPropagation();
        if (state.segments.length === 1) return;
        state.segments.splice(index, 1);
        selectedSegment = Math.min(selectedSegment, state.segments.length - 1);
        quizActive = false;
        updateAll();
      });
      els.list.appendChild(row);
    });
  }

  function selectSegment(index) {
    selectedSegment = Math.max(0, Math.min(index, state.segments.length - 1));
    renderSegments();
    updateVisualsOnly();
  }

  function domainToThree(point, origin, datumZ) {
    return new THREE.Vector3((point.e - origin.e) / 1000, (point.z - datumZ) / 1000, (point.n - origin.n) / 1000);
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xedf0f1);
    camera = new THREE.PerspectiveCamera(42, 1, 0.01, 200);
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    els.viewport.insertBefore(renderer.domElement, els.viewport.firstChild);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.addEventListener('change', markDirty);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x71808a, 1.45));
    const light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(6, 10, 8);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    scene.add(light);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0xf4f5f5, roughness: 0.92 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    grid = new THREE.GridHelper(30, 30, 0xa5adb2, 0xd3d8db);
    grid.material.opacity = 0.48;
    grid.material.transparent = true;
    scene.add(grid);

    const axes = new THREE.Group();
    axes.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.02, 0), 1.2, 0xd24f45, 0.16, 0.08));
    axes.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.02, 0), 1.2, 0x2776a5, 0.16, 0.08));
    axes.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0.02, 0), 1.2, 0x3f8a5c, 0.16, 0.08));
    scene.add(axes);

    pipeGroup = new THREE.Group();
    shadowGroup = new THREE.Group();
    scene.add(shadowGroup, pipeGroup);
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    renderer.domElement.addEventListener('pointerdown', onScenePointer);
    new ResizeObserver(resizeThree).observe(els.viewport);
    animate();
  }

  function resizeThree() {
    const width = Math.max(1, els.viewport.clientWidth);
    const height = Math.max(1, els.viewport.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    markDirty();
  }

  function clearGroup(group) {
    while (group.children.length) {
      const child = group.children.pop();
      // 只释放非缓存的几何体（线条等动态创建的）
      if (child.geometry && !geometryCache.cylinders.has(child.geometry) && !geometryCache.spheres.has(child.geometry)) {
        child.geometry.dispose();
      }
      // 只释放非缓存的材质
      if (child.material && !Object.values(materialCache.pipes).includes(child.material) && !Object.values(materialCache.joints).includes(child.material)) {
        child.material.dispose();
      }
    }
  }

  function cylinderBetween(start, end, radius, material) {
    const delta = new THREE.Vector3().subVectors(end, start);
    const length = delta.length();
    const geometry = geometryCache.getCylinder(radius, length);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function rebuildThree() {
    clearGroup(pipeGroup);
    clearGroup(shadowGroup);
    pipeMeshes = [];
    const points = getPoints();
    const origin = points[0];
    const datumZ = Math.min(...points.map((point) => point.z));
    pointVectors = points.map((point) => domainToThree(point, origin, datumZ));
    const radius = Math.max(VISUAL_CONFIG.pipe.minRadius, Math.min(VISUAL_CONFIG.pipe.maxRadius, state.dn / VISUAL_CONFIG.pipe.dnScale));
    pointVectors.slice(0, -1).forEach((start, index) => {
      const material = materialCache.getPipeMaterial(index === selectedSegment);
      const mesh = cylinderBetween(start, pointVectors[index + 1], radius, material);
      mesh.userData.segmentIndex = index;
      pipeMeshes.push(mesh);
      pipeGroup.add(mesh);
    });
    pointVectors.forEach((point, index) => {
      const jointRadius = radius * VISUAL_CONFIG.joint.radiusScale;
      const material = materialCache.getJointMaterial(index === selectedSegment + 1);
      const geometry = geometryCache.getSphere(jointRadius);
      const joint = new THREE.Mesh(geometry, material);
      joint.position.copy(point);
      joint.castShadow = true;
      pipeGroup.add(joint);
    });

    const shadowPoints = pointVectors.map((p) => new THREE.Vector3(p.x, VISUAL_CONFIG.shadow.yOffset, p.z));
    const shadowGeometry = new THREE.BufferGeometry().setFromPoints(shadowPoints);
    const shadowMaterial = new THREE.LineDashedMaterial({
      color: VISUAL_CONFIG.colors.shadow,
      dashSize: VISUAL_CONFIG.shadow.dashSize,
      gapSize: VISUAL_CONFIG.shadow.gapSize,
      transparent: true,
      opacity: VISUAL_CONFIG.shadow.opacity
    });
    const shadowLine = new THREE.Line(shadowGeometry, shadowMaterial);
    shadowLine.computeLineDistances();
    shadowGroup.add(shadowLine);
    pointVectors.forEach((point) => {
      if (Math.abs(point.y) < 0.01) return;
      const g = new THREE.BufferGeometry().setFromPoints([point, new THREE.Vector3(point.x, VISUAL_CONFIG.shadow.yOffset, point.z)]);
      const m = new THREE.LineDashedMaterial({
        color: VISUAL_CONFIG.colors.dropLine,
        dashSize: VISUAL_CONFIG.dropLine.dashSize,
        gapSize: VISUAL_CONFIG.dropLine.gapSize,
        transparent: true,
        opacity: VISUAL_CONFIG.dropLine.opacity
      });
      const line = new THREE.Line(g, m);
      line.computeLineDistances();
      shadowGroup.add(line);
    });
    shadowGroup.visible = getCachedElement('shadowToggle').checked;
    pipeGroup.visible = !quizActive;
    rebuildCoordLabels();
    markDirty();
  }

  function fitCamera(view = currentView) {
    const box = new THREE.Box3().setFromPoints(pointVectors.length ? pointVectors : [new THREE.Vector3()]);
    const center = box.getCenter(new THREE.Vector3());
    const size = Math.max(box.getSize(new THREE.Vector3()).length(), 2.5);
    const distance = size * 1.35;
    const directions = {
      iso: new THREE.Vector3(1.1, 0.85, 1.1),
      top: new THREE.Vector3(0.001, 1.8, 0.001),
      front: new THREE.Vector3(0, 0.35, -1.7),
      right: new THREE.Vector3(1.7, 0.35, 0)
    };
    camera.position.copy(center).add(directions[view].normalize().multiplyScalar(distance));
    camera.near = 0.01;
    camera.far = Math.max(100, distance * 10);
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();
    markDirty();
  }

  function onScenePointer(event) {
    if (quizActive) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pipeMeshes, false)[0];
    if (hit) selectSegment(hit.object.userData.segmentIndex);
  }

  function rebuildCoordLabels() {
    els.labels.innerHTML = '';
    const points = getPoints();
    const visibleIndexes = new Set([0, selectedSegment + 1, points.length - 1]);
    pointVectors.forEach((vector, index) => {
      if (!visibleIndexes.has(index)) return;
      const tag = document.createElement('div');
      tag.className = `coord-tag${index === selectedSegment + 1 ? ' is-selected' : ''}`;
      tag.dataset.pointIndex = index;
      tag.textContent = `P${index} · E${fmt(points[index].e)} N${fmt(points[index].n)} EL${fmt(points[index].z)}`;
      els.labels.appendChild(tag);
    });
  }

  function positionCoordLabels() {
    if (!getCachedElement('labelToggle').checked || quizActive) {
      els.labels.style.display = 'none';
      return;
    }
    els.labels.style.display = '';
    const width = els.viewport.clientWidth;
    const height = els.viewport.clientHeight;
    const placed = [];
    Array.from(els.labels.children).forEach((tag) => {
      const pointIndex = Number(tag.dataset.pointIndex);
      const p = pointVectors[pointIndex].clone().project(camera);
      const baseX = (p.x * 0.5 + 0.5) * width;
      const baseY = (-p.y * 0.5 + 0.5) * height;
      const tagWidth = Math.min(190, Math.max(118, tag.textContent.length * 5.8));
      const tagHeight = 22;
      const offsets = [[0, -32], [0, 10], [tagWidth * 0.62, -12], [-tagWidth * 0.62, -12], [0, -56], [0, 34]];
      let chosen = null;
      for (const [dx, dy] of offsets) {
        const rect = {
          left: Math.max(4, Math.min(width - tagWidth - 4, baseX + dx - tagWidth / 2)),
          top: Math.max(4, Math.min(height - tagHeight - 4, baseY + dy)),
          width: tagWidth,
          height: tagHeight
        };
        const overlaps = placed.some((other) => !(rect.left + rect.width + 4 < other.left || other.left + other.width + 4 < rect.left || rect.top + rect.height + 3 < other.top || other.top + other.height + 3 < rect.top));
        if (!overlaps) { chosen = rect; break; }
      }
      chosen = chosen || { left: baseX - tagWidth / 2, top: baseY - 32, width: tagWidth, height: tagHeight };
      tag.style.left = `${chosen.left}px`;
      tag.style.top = `${chosen.top}px`;
      tag.style.width = `${tagWidth}px`;
      tag.style.transform = 'none';
      tag.style.visibility = p.z > 1 ? 'hidden' : 'visible';
      if (p.z <= 1) placed.push(chosen);
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    positionCoordLabels();
    // 只在需要时渲染
    if (needsRender) {
      needsRender = false;
      renderer.render(scene, camera);
    }
  }

  function projectIso(point) {
    return { x: (point.e - point.n) * 0.8660254, y: (point.e + point.n) * 0.5 - point.z };
  }

  function renderIso() {
    const points = getPoints();
    const startPoint = points[0];
    const datumZ = Math.min(...points.map((point) => point.z));
    const localPoints = points.map((point) => ({ e: point.e - startPoint.e, n: point.n - startPoint.n, z: point.z - datumZ }));
    const projected = localPoints.map(projectIso);
    const shadows = localPoints.map((p) => projectIso({ e: p.e, n: p.n, z: 0 }));
    const all = projected.concat(shadows, [{ x: 0, y: 0 }, { x: 700, y: 350 }, { x: -700, y: 350 }, { x: 0, y: -700 }]);
    const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const width = 420, height = 390, pad = 44;
    const scale = Math.min((width - pad * 2) / Math.max(1, maxX - minX), (height - pad * 2) / Math.max(1, maxY - minY));
    const map = (p) => ({ x: pad + (p.x - minX) * scale, y: pad + (p.y - minY) * scale });
    const mp = projected.map(map), ms = shadows.map(map);
    const svg = [];
    const shadowPath = ms.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    svg.push(`<polyline class="iso-shadow" points="${shadowPath}"/>`);
    mp.forEach((p, i) => {
      if (Math.abs(points[i].z) > 0.01) svg.push(`<line class="iso-drop" x1="${p.x}" y1="${p.y}" x2="${ms[i].x}" y2="${ms[i].y}"/>`);
    });
    for (let i = 0; i < mp.length - 1; i++) {
      svg.push(`<line class="iso-segment${i === selectedSegment ? ' is-selected' : ''}" x1="${mp[i].x}" y1="${mp[i].y}" x2="${mp[i + 1].x}" y2="${mp[i + 1].y}" data-index="${i}"/>`);
      const midX = (mp[i].x + mp[i + 1].x) / 2;
      const midY = (mp[i].y + mp[i + 1].y) / 2 - 7;
      const seg = state.segments[i];
      const label = seg.dir === 'XYZ' ? `ΔXYZ` : `${seg.dir} ${fmt(seg.length)}`;
      svg.push(`<text class="iso-step-label" x="${midX}" y="${midY}" text-anchor="middle">${label}</text>`);
    }
    mp.forEach((p, i) => {
      svg.push(`<circle class="iso-point${i === selectedSegment + 1 ? ' is-selected' : ''}" cx="${p.x}" cy="${p.y}" r="4"/>`);
      if (!quizActive) svg.push(`<text class="iso-label" x="${p.x + 7}" y="${p.y - 7}">P${i}</text>`);
    });
    const origin = map({ x: 0, y: 0 });
    const e = map(projectIso({ e: 500, n: 0, z: 0 }));
    const nn = map(projectIso({ e: 0, n: 500, z: 0 }));
    const z = map(projectIso({ e: 0, n: 0, z: 500 }));
    svg.push(`<g aria-hidden="true"><line class="iso-axis-east" x1="${origin.x}" y1="${origin.y}" x2="${e.x}" y2="${e.y}"/><line class="iso-axis-north" x1="${origin.x}" y1="${origin.y}" x2="${nn.x}" y2="${nn.y}"/><line class="iso-axis-elev" x1="${origin.x}" y1="${origin.y}" x2="${z.x}" y2="${z.y}"/><text class="iso-label" x="${e.x + 4}" y="${e.y}">E</text><text class="iso-label" x="${nn.x - 10}" y="${nn.y}">N</text><text class="iso-label" x="${z.x + 4}" y="${z.y}">EL</text></g>`);
    els.isoSvg.innerHTML = `<title>管路等轴单线图</title><desc>展示管路走向、坐标点和地面投影</desc>${svg.join('')}`;
    els.isoSvg.querySelectorAll('.iso-segment').forEach((line) => line.addEventListener('click', () => selectSegment(Number(line.dataset.index))));
  }

  function renderCoordinateTable() {
    const points = getPoints();
    els.coordTable.innerHTML = points.map((p, i) => `<tr class="${i === selectedSegment + 1 ? 'is-selected' : ''}"><td>P${i}</td><td>${fmt(p.e)}</td><td>${fmt(p.n)}</td><td>${fmt(p.z)}</td></tr>`).join('');
    const first = points[0], last = points[points.length - 1];
    els.startCoord.textContent = `E ${fmt(first.e)} · N ${fmt(first.n)} · EL ${fmt(first.z)}`;
    els.endCoord.textContent = quizActive ? '答案已隐藏' : `E ${fmt(last.e)} · N ${fmt(last.n)} · EL ${fmt(last.z)}`;
  }

  function updateStepReadout() {
    const segment = state.segments[selectedSegment];
    els.selectedLabel.textContent = `第 ${selectedSegment + 1} 段 / 共 ${state.segments.length} 段`;
    els.selectedValue.textContent = segmentText(segment);
  }

  function updateVisualsOnly() {
    rebuildThree();
    renderIso();
    renderCoordinateTable();
    updateStepReadout();
    els.quizCover.hidden = !quizActive;
  }

  function updateAll(shouldFit = false) {
    renderSegments();
    rebuildThree();
    renderIso();
    renderCoordinateTable();
    updateStepReadout();
    els.quizCover.hidden = !quizActive;
    if (shouldFit) fitCamera();
  }

  function updateCaseFavoriteButton() {
    const button = document.getElementById('caseFavoriteBtn');
    if (!button) return;
    const favorite = favoritePresets.has(activePreset);
    button.classList.toggle('is-active', favorite);
    button.textContent = favorite ? '★' : '☆';
    button.setAttribute('aria-label', favorite ? '取消收藏当前案例' : '收藏当前案例');
    button.title = favorite ? '取消收藏当前案例' : '收藏当前案例';
  }

  function applyCaseFilter(filter = activeCaseFilter) {
    activeCaseFilter = filter;
    document.querySelectorAll('.case-filter-btn').forEach((button) => button.classList.toggle('is-active', button.dataset.caseFilter === filter));
    const buttons = Array.from(document.querySelectorAll('.preset-btn'));
    buttons.forEach((button) => {
      const visible = filter === 'all' || button.dataset.caseGroup === filter || (filter === 'favorite' && favoritePresets.has(button.dataset.preset));
      button.hidden = !visible;
    });
    const commonVisible = buttons.some((button) => !button.hidden && button.dataset.caseGroup === 'common');
    const specialVisible = buttons.some((button) => !button.hidden && button.dataset.caseGroup === 'special');
    const commonLabel = document.querySelector('.preset-group-label:not(.is-special)');
    const specialLabel = document.querySelector('.preset-group-label.is-special');
    if (commonLabel) commonLabel.hidden = !commonVisible;
    if (specialLabel) specialLabel.hidden = !specialVisible;
  }

  function initCaseLibrary() {
    document.querySelectorAll('.case-filter-btn').forEach((button) => button.addEventListener('click', () => applyCaseFilter(button.dataset.caseFilter)));
    document.getElementById('caseFavoriteBtn').addEventListener('click', () => {
      if (favoritePresets.has(activePreset)) favoritePresets.delete(activePreset);
      else favoritePresets.add(activePreset);
      saveFavoritePresets();
      updateCaseFavoriteButton();
      if (activeCaseFilter === 'favorite') applyCaseFilter('favorite');
      renderProfilePage();
    });
    updateCaseFavoriteButton();
    applyCaseFilter('all');
  }

  function setPreset(name) {
    activePreset = name;
    state = copyPreset(name);
    selectedSegment = 0;
    quizActive = false;
    syncHeaderInputs();
    document.querySelectorAll('.preset-btn').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.preset === name));
    updateAll(true);
    updateCaseFavoriteButton();
  }

  function randomChallenge() {
    const keys = ['E', 'W', 'N', 'S', 'U', 'D'];
    const count = 4 + Math.floor(Math.random() * 3);
    state = {
      start: [0, 0, [0, 300, 500][Math.floor(Math.random() * 3)]],
      dn: [65, 80, 100, 150][Math.floor(Math.random() * 4)],
      segments: Array.from({ length: count }, (_, index) => {
        let dir = keys[Math.floor(Math.random() * keys.length)];
        if (index && dir === state?.segments?.[index - 1]?.dir) dir = keys[(keys.indexOf(dir) + 2) % keys.length];
        return { dir, length: [400, 500, 600, 750, 900, 1000, 1200][Math.floor(Math.random() * 7)] };
      })
    };
    selectedSegment = 0;
    quizActive = true;
    syncHeaderInputs();
    document.querySelectorAll('.preset-btn').forEach((btn) => btn.classList.remove('is-active'));
    ['answerE', 'answerN', 'answerZ'].forEach((id) => document.getElementById(id).value = '');
    els.quizMessage.textContent = '';
    els.quizMessage.className = 'status-line';
    updateAll(true);
  }

  function checkAnswer() {
    const points = getPoints();
    const end = points[points.length - 1];
    const answers = [n(document.getElementById('answerE').value, NaN), n(document.getElementById('answerN').value, NaN), n(document.getElementById('answerZ').value, NaN)];
    if (answers.some(Number.isNaN)) {
      els.quizMessage.textContent = '请填写三个终点坐标。';
      els.quizMessage.className = 'status-line is-error';
      return;
    }
    const correct = answers[0] === end.e && answers[1] === end.n && answers[2] === end.z;
    els.quizMessage.textContent = correct ? '坐标正确。' : '还不对，按每一段的正负方向重新累计。';
    els.quizMessage.className = `status-line ${correct ? 'is-success' : 'is-error'}`;
    if (!correct) recordWrongQuestion(`coordinate-${Date.now()}`, `坐标累计：${state.segments.length}段管线终点计算`, 'trainer');
  }

  function currentTrainingTrack() {
    return trainingTracks[activeTrainingTrack];
  }

  function currentTrainingLesson() {
    const track = currentTrainingTrack();
    return track.lessons.find((lesson) => lesson.id === activeTrainingLesson) || track.lessons[0];
  }

  function renderTrainingModules() {
    const track = currentTrainingTrack();
    const lesson = currentTrainingLesson();
    const allLessons = Object.values(trainingTracks).flatMap((item) => item.lessons);
    const completeCount = allLessons.filter((item) => completedTrainingLessons.has(item.id)).length;

    document.getElementById('moduleTrackList').innerHTML = Object.entries(trainingTracks).map(([key, item]) => {
      const count = item.lessons.filter((entry) => completedTrainingLessons.has(entry.id)).length;
      return `<button class="module-track-btn${key === activeTrainingTrack ? ' is-active' : ''}" type="button" data-track="${key}">
        <b>${item.code}</b><span><strong>${item.title}</strong><small>${item.short} · ${count}/${item.lessons.length}</small></span>
      </button>`;
    }).join('');

    document.getElementById('moduleTrackCode').textContent = track.code;
    document.getElementById('moduleTrackTitle').textContent = track.title;
    document.getElementById('moduleTrackSummary').textContent = track.summary;
    document.getElementById('moduleWorkflow').innerHTML = track.workflow.map((item, index) => `
      <div class="workflow-step"><b>${String(index + 1).padStart(2, '0')}</b><strong>${item[0]}</strong><span>${item[1]}</span></div>
    `).join('');

    document.getElementById('moduleLessonList').innerHTML = track.lessons.map((item) => {
      const complete = completedTrainingLessons.has(item.id);
      return `<button class="module-lesson-btn${item.id === lesson.id ? ' is-active' : ''}${complete ? ' is-complete' : ''}" type="button" data-lesson="${item.id}">
        <span class="lesson-status">✓</span><span><strong>${item.title}</strong><small>${item.stage}</small></span>
      </button>`;
    }).join('');

    document.getElementById('moduleLessonStage').textContent = lesson.stage;
    document.getElementById('moduleLessonTitle').textContent = lesson.title;
    document.getElementById('moduleLessonFocus').textContent = lesson.focus;
    document.getElementById('moduleLessonSteps').innerHTML = lesson.steps.map((item) => `<li>${item}</li>`).join('');
    document.getElementById('moduleLessonChecks').innerHTML = lesson.checks.map((item) => `<li>${item}</li>`).join('');

    const completeButton = document.getElementById('moduleCompleteBtn');
    const lessonComplete = completedTrainingLessons.has(lesson.id);
    completeButton.textContent = lessonComplete ? '已掌握 · 点击取消' : '标记本课已掌握';
    completeButton.classList.toggle('is-complete', lessonComplete);

    document.getElementById('moduleProgressText').textContent = `${completeCount} / ${allLessons.length}`;
    document.getElementById('moduleProgressBar').style.width = `${completeCount / allLessons.length * 100}%`;
    document.querySelector('.module-progress-track').setAttribute('aria-valuenow', String(completeCount));
    document.querySelector('.module-progress-track').setAttribute('aria-valuemax', String(allLessons.length));

    renderTrainingScenario();
  }

  function renderTrainingScenario() {
    const questions = currentTrainingTrack().quiz;
    const question = questions[activeScenario];
    document.getElementById('scenarioCounter').textContent = `${activeScenario + 1} / ${questions.length}`;
    document.getElementById('scenarioQuestion').textContent = question.q;
    document.getElementById('scenarioChoices').innerHTML = question.a.map((item, index) => {
      let stateClass = '';
      if (scenarioAnswered && index === question.correct) stateClass = ' is-correct';
      else if (scenarioAnswered && index === selectedScenarioAnswer) stateClass = ' is-wrong';
      return `<button class="scenario-choice${stateClass}" type="button" data-answer="${index}"${scenarioAnswered ? ' disabled' : ''}>${String.fromCharCode(65 + index)}. ${item}</button>`;
    }).join('');

    const feedback = document.getElementById('scenarioFeedback');
    const correct = selectedScenarioAnswer === question.correct;
    feedback.textContent = scenarioAnswered ? `${correct ? '判断正确。' : '这一步有风险。'}${question.why}` : '选择你在现场会采取的第一步。';
    feedback.className = `scenario-feedback${scenarioAnswered ? (correct ? ' is-success' : ' is-error') : ''}`;
    document.getElementById('scenarioNextBtn').hidden = !scenarioAnswered;
  }

  function saveTrainingProgress() {
    writeJson(profileKey('pipe-module-progress'), Array.from(completedTrainingLessons));
    renderProfilePage();
  }

  function initTrainingModules() {
    try {
      const saved = JSON.parse(localStorage.getItem(profileKey('pipe-module-progress')) || '[]');
      completedTrainingLessons = new Set(Array.isArray(saved) ? saved : []);
    } catch (error) {
      completedTrainingLessons = new Set();
    }

    document.getElementById('moduleTrackList').addEventListener('click', (event) => {
      const button = event.target.closest('[data-track]');
      if (!button) return;
      activeTrainingTrack = button.dataset.track;
      activeTrainingLesson = currentTrainingTrack().lessons[0].id;
      activeScenario = 0;
      scenarioAnswered = false;
      selectedScenarioAnswer = null;
      renderTrainingModules();
    });

    document.getElementById('moduleLessonList').addEventListener('click', (event) => {
      const button = event.target.closest('[data-lesson]');
      if (!button) return;
      activeTrainingLesson = button.dataset.lesson;
      renderTrainingModules();
    });

    document.getElementById('moduleCompleteBtn').addEventListener('click', () => {
      const lesson = currentTrainingLesson();
      if (completedTrainingLessons.has(lesson.id)) completedTrainingLessons.delete(lesson.id);
      else completedTrainingLessons.add(lesson.id);
      saveTrainingProgress();
      renderTrainingModules();
    });

    document.getElementById('scenarioChoices').addEventListener('click', (event) => {
      const button = event.target.closest('[data-answer]');
      if (!button || scenarioAnswered) return;
      selectedScenarioAnswer = Number(button.dataset.answer);
      scenarioAnswered = true;
      const question = currentTrainingTrack().quiz[activeScenario];
      if (selectedScenarioAnswer !== question.correct) recordWrongQuestion(`scenario-${activeTrainingTrack}-${activeScenario}`, `${currentTrainingTrack().title}：${question.q}`, 'modules');
      renderTrainingScenario();
    });

    document.getElementById('scenarioNextBtn').addEventListener('click', () => {
      const questions = currentTrainingTrack().quiz;
      activeScenario = (activeScenario + 1) % questions.length;
      scenarioAnswered = false;
      selectedScenarioAnswer = null;
      renderTrainingScenario();
    });

    renderTrainingModules();
  }

  function profileDataBases() {
    return ['pipe-route-progress', 'pipe-module-progress', 'pipe-favorite-presets', 'pipe-wrong-questions', 'pipe-quick-history'];
  }

  function renderProfilePage() {
    const select = document.getElementById('learnerProfileSelect');
    if (!select) return;
    select.innerHTML = learnerProfiles.map((profile) => `<option value="${escapeHtml(profile.id)}"${profile.id === activeProfileId ? ' selected' : ''}>${escapeHtml(profile.name)}</option>`).join('');
    const route = readJson(profileKey('pipe-route-progress'), []);
    const modules = readJson(profileKey('pipe-module-progress'), []);
    document.getElementById('profileRouteStat').textContent = `${Array.isArray(route) ? route.length : 0} / 16`;
    document.getElementById('profileModuleStat').textContent = `${Array.isArray(modules) ? modules.length : 0} / 20`;
    document.getElementById('profileFavoriteStat').textContent = String(favoritePresets.size);
    document.getElementById('profileWrongStat').textContent = String(wrongQuestionRecords.length);

    const favoriteList = document.getElementById('profileFavoriteList');
    favoriteList.innerHTML = favoritePresets.size ? Array.from(favoritePresets).map((key) => `<div class="profile-list-row"><span>${escapeHtml(presetTitles[key] || key)}</span><button type="button" data-open-preset="${escapeHtml(key)}">打开</button></div>`).join('') : '<div class="profile-empty">还没有收藏案例。</div>';
    const wrongList = document.getElementById('profileWrongList');
    wrongList.innerHTML = wrongQuestionRecords.length ? wrongQuestionRecords.slice(0, 10).map((item) => `<div class="profile-list-row"><span>${escapeHtml(item.label)}</span><button type="button" data-review-destination="${escapeHtml(item.destination || 'modules')}">复习</button></div>`).join('') : '<div class="profile-empty">暂时没有错题。</div>';
  }

  function applyActiveProfileState() {
    loadProfileVariables();
    const route = readJson(profileKey('pipe-route-progress'), []);
    document.querySelectorAll('[data-task]').forEach((checkbox) => checkbox.checked = Array.isArray(route) && route.includes(checkbox.dataset.task));
    saveRouteProgress(false);
    completedTrainingLessons = new Set(readJson(profileKey('pipe-module-progress'), []));
    renderTrainingModules();
    updateCaseFavoriteButton();
    applyCaseFilter(activeCaseFilter);
    renderQuickHistory();
    renderProfilePage();
  }

  function switchLearnerProfile(profileId) {
    if (!learnerProfiles.some((profile) => profile.id === profileId)) return;
    activeProfileId = profileId;
    localStorage.setItem('pipe-active-profile', activeProfileId);
    applyActiveProfileState();
  }

  function exportLearningData() {
    const data = {};
    learnerProfiles.forEach((profile) => {
      data[profile.id] = {};
      profileDataBases().forEach((base) => data[profile.id][base] = readJson(profileKey(base, profile.id), []));
    });
    const payload = { version: 1, exportedAt: new Date().toISOString(), profiles: learnerProfiles, activeProfileId, data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pipe-learning-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 500);
  }

  function importLearningData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const message = document.getElementById('profileMessage');
      try {
        const payload = JSON.parse(reader.result);
        if (!Array.isArray(payload.profiles) || !payload.data) throw new Error('文件格式不正确');
        learnerProfiles = payload.profiles.filter((profile) => profile && profile.id && profile.name);
        if (!learnerProfiles.length) throw new Error('没有学习者数据');
        localStorage.setItem('pipe-learner-profiles', JSON.stringify(learnerProfiles));
        learnerProfiles.forEach((profile) => profileDataBases().forEach((base) => {
          const value = payload.data[profile.id]?.[base] ?? [];
          localStorage.setItem(profileKey(base, profile.id), JSON.stringify(value));
        }));
        activeProfileId = learnerProfiles.some((profile) => profile.id === payload.activeProfileId) ? payload.activeProfileId : learnerProfiles[0].id;
        localStorage.setItem('pipe-active-profile', activeProfileId);
        applyActiveProfileState();
        message.textContent = '学习数据已导入。';
        message.className = 'status-line is-success';
      } catch (error) {
        message.textContent = `导入失败：${error.message}`;
        message.className = 'status-line is-error';
      }
    };
    reader.readAsText(file);
  }

  function initProfileUI() {
    document.getElementById('learnerProfileSelect').addEventListener('change', (event) => switchLearnerProfile(event.target.value));
    document.getElementById('addLearnerBtn').addEventListener('click', () => {
      const input = document.getElementById('newLearnerName');
      const name = input.value.trim();
      if (!name) return;
      const profile = { id: `learner-${Date.now()}`, name, createdAt: new Date().toISOString() };
      learnerProfiles.push(profile);
      localStorage.setItem('pipe-learner-profiles', JSON.stringify(learnerProfiles));
      input.value = '';
      switchLearnerProfile(profile.id);
    });
    document.getElementById('profileFavoriteList').addEventListener('click', (event) => {
      const button = event.target.closest('[data-open-preset]');
      if (!button) return;
      document.querySelector('[data-page="trainer"]').click();
      setPreset(button.dataset.openPreset);
    });
    document.getElementById('profileWrongList').addEventListener('click', (event) => {
      const button = event.target.closest('[data-review-destination]');
      if (button) document.querySelector(`[data-page="${button.dataset.reviewDestination}"]`)?.click();
    });
    document.querySelectorAll('.profile-jump').forEach((button) => button.addEventListener('click', () => document.querySelector(`[data-page="${button.dataset.profileJump}"]`)?.click()));
    document.getElementById('exportLearningDataBtn').addEventListener('click', exportLearningData);
    document.getElementById('importLearningDataInput').addEventListener('change', (event) => {
      if (event.target.files[0]) importLearningData(event.target.files[0]);
      event.target.value = '';
    });
    document.getElementById('resetLearnerBtn').addEventListener('click', () => {
      if (!confirm('确定清空当前学习者的进度、收藏、错题和计算历史吗？')) return;
      profileDataBases().forEach((base) => localStorage.removeItem(profileKey(base)));
      applyActiveProfileState();
      document.getElementById('profileMessage').textContent = '当前学习者数据已清空。';
    });
    renderProfilePage();
  }

  function calcValue(id, fallback = 0) {
    return n(document.getElementById(id).value, fallback);
  }

  function calcNumber(value, digits = 1) {
    return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: digits, minimumFractionDigits: digits });
  }

  function updateAngleCalculator() {
    const deltaE = calcValue('calcDeltaE');
    const deltaN = calcValue('calcDeltaN');
    const deltaZ = calcValue('calcDeltaZ');
    const planOffset = Math.hypot(deltaE, deltaN);
    const trueLength = Math.hypot(deltaE, deltaN, deltaZ);
    const bearing = planOffset > 0 ? (Math.atan2(deltaN, deltaE) * 180 / Math.PI + 360) % 360 : null;
    const slopeAngle = planOffset > 0 ? Math.atan2(deltaZ, planOffset) * 180 / Math.PI : null;
    const slopeGrade = planOffset > 0 ? deltaZ / planOffset * 100 : null;
    const quickOffset = Math.max(0, calcValue('quickOffset'));
    const quickAngle = Math.max(1, Math.min(89, calcValue('quickOffsetAngle', 45)));
    const quickRadians = quickAngle * Math.PI / 180;
    const quickTravel = quickOffset / Math.sin(quickRadians);
    const quickRun = quickOffset / Math.tan(quickRadians);

    getCachedElement('anglePlanResult').textContent = `${calcNumber(planOffset)} mm`;
    getCachedElement('angleTrueResult').textContent = `${calcNumber(trueLength)} mm`;
    getCachedElement('angleBearingResult').textContent = bearing === null ? '无水平走向' : `${calcNumber(bearing, 2)}°（从 E+ 转向 N+）`;
    getCachedElement('angleSlopeResult').textContent = slopeAngle === null ? '垂直管段' : `${calcNumber(slopeAngle, 2)}° / ${calcNumber(slopeGrade, 2)}%`;
    getCachedElement('quickTravelResult').textContent = `${calcNumber(quickTravel)} mm`;
    getCachedElement('quickRunResult').textContent = `${calcNumber(quickRun)} mm`;

    const planScale = 105 / Math.max(Math.abs(deltaE), Math.abs(deltaN), 1);
    const originX = 165, originY = 166;
    const pointX = originX + deltaE * planScale, pointY = originY - deltaN * planScale;
    const sideScale = 175 / Math.max(planOffset, Math.abs(deltaZ), 1);
    const sideOriginX = 370, sideOriginY = 245;
    const sideEndX = sideOriginX + planOffset * sideScale, sideEndY = sideOriginY - deltaZ * sideScale;
    getCachedElement('angleDiagram').innerHTML = `
      <title>空间偏移平面与立面分解</title><desc>左侧为东西北向平面投影，右侧为平面距离与高差组成的立面三角形</desc>
      <text x="28" y="28">平面图</text><text class="diagram-muted" x="345" y="28">立面图</text>
      <line class="diagram-axis" x1="35" y1="${originY}" x2="295" y2="${originY}"/><line class="diagram-axis" x1="${originX}" y1="40" x2="${originX}" y2="290"/>
      <text class="diagram-muted" x="278" y="${originY - 8}">E+</text><text class="diagram-muted" x="${originX + 8}" y="52">N+</text>
      <line class="diagram-main" x1="${originX}" y1="${originY}" x2="${pointX}" y2="${pointY}"/><circle class="diagram-point" cx="${originX}" cy="${originY}" r="5"/><circle class="diagram-point" cx="${pointX}" cy="${pointY}" r="5"/>
      <text class="diagram-muted" x="${Math.min(270, Math.max(38, pointX + 8))}" y="${Math.min(282, Math.max(50, pointY - 8))}">ΔE ${calcNumber(deltaE, 0)} · ΔN ${calcNumber(deltaN, 0)}</text>
      <line class="diagram-axis" x1="${sideOriginX}" y1="${sideOriginY}" x2="590" y2="${sideOriginY}"/><line class="diagram-axis" x1="${sideOriginX}" y1="45" x2="${sideOriginX}" y2="285"/>
      <line class="diagram-grid" x1="${sideOriginX}" y1="${sideEndY}" x2="${sideEndX}" y2="${sideEndY}"/><line class="diagram-grid" x1="${sideEndX}" y1="${sideOriginY}" x2="${sideEndX}" y2="${sideEndY}"/>
      <line class="diagram-main" x1="${sideOriginX}" y1="${sideOriginY}" x2="${sideEndX}" y2="${sideEndY}"/><circle class="diagram-point" cx="${sideOriginX}" cy="${sideOriginY}" r="5"/><circle class="diagram-point" cx="${sideEndX}" cy="${sideEndY}" r="5"/>
      <text class="diagram-muted" x="${(sideOriginX + sideEndX) / 2 - 28}" y="${sideOriginY + 20}">平面 ${calcNumber(planOffset, 0)}</text><text class="diagram-muted" x="${Math.min(550, sideEndX + 7)}" y="${(sideOriginY + sideEndY) / 2}">EL ${calcNumber(deltaZ, 0)}</text>
    `;
  }

  function updateReturnCalculator() {
    const offset = Math.max(0, calcValue('returnOffset'));
    const angle = Math.max(1, Math.min(89, calcValue('returnAngle', 45)));
    const radius = Math.max(0, calcValue('returnRadius'));
    const radians = angle * Math.PI / 180;
    const travel = offset / Math.sin(radians);
    const run = offset / Math.tan(radians);
    const tangent = radius * Math.tan(radians / 2);
    const straight = travel - tangent * 2;

    document.getElementById('returnTravelResult').textContent = `${calcNumber(travel)} mm`;
    document.getElementById('returnRunResult').textContent = `${calcNumber(run)} mm`;
    document.getElementById('returnTangentResult').textContent = `${calcNumber(tangent)} mm`;
    document.getElementById('returnStraightResult').textContent = `${calcNumber(Math.max(0, straight))} mm`;
    document.getElementById('returnError').textContent = straight < 0 ? '当前偏心距放不下两只所选半径的弯头，请增大偏心距、减小R或改变角度。' : '';

    const scale = Math.min(300 / Math.max(run, 1), 170 / Math.max(offset, 1));
    const x1 = 145, y1 = 255;
    const x2 = x1 + run * scale, y2 = y1 - offset * scale;
    const tRatio = Math.min(0.45, travel > 0 ? tangent / travel : 0);
    const tx1 = x1 + (x2 - x1) * tRatio, ty1 = y1 + (y2 - y1) * tRatio;
    const tx2 = x2 - (x2 - x1) * tRatio, ty2 = y2 - (y2 - y1) * tRatio;
    document.getElementById('returnDiagram').innerHTML = `
      <title>来回弯S形偏移中心线</title><desc>两条平行管线通过两个同角度弯头和一段斜管完成偏移</desc>
      <text x="28" y="30">S形中心线 · ${calcNumber(angle, 1)}°</text>
      <line class="diagram-main" x1="35" y1="${y1}" x2="${x1}" y2="${y1}"/>
      <line class="diagram-main" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
      <line class="diagram-main" x1="${x2}" y1="${y2}" x2="585" y2="${y2}"/>
      <line class="diagram-accent" x1="${x1}" y1="${y1}" x2="${tx1}" y2="${ty1}"/><line class="diagram-accent" x1="${tx2}" y1="${ty2}" x2="${x2}" y2="${y2}"/>
      <line class="diagram-grid" x1="${x1}" y1="292" x2="${x2}" y2="292"/><line class="diagram-grid" x1="${x1}" y1="280" x2="${x1}" y2="304"/><line class="diagram-grid" x1="${x2}" y1="280" x2="${x2}" y2="304"/>
      <text class="diagram-muted" x="${(x1 + x2) / 2 - 38}" y="317">水平占用 ${calcNumber(run, 0)}</text>
      <line class="diagram-grid" x1="${x2 + 38}" y1="${y1}" x2="${x2 + 38}" y2="${y2}"/><line class="diagram-grid" x1="${x2 + 28}" y1="${y1}" x2="${x2 + 48}" y2="${y1}"/><line class="diagram-grid" x1="${x2 + 28}" y1="${y2}" x2="${x2 + 48}" y2="${y2}"/>
      <text class="diagram-muted" x="${x2 + 48}" y="${(y1 + y2) / 2}">偏心 ${calcNumber(offset, 0)}</text>
      <text class="diagram-muted" x="${(x1 + x2) / 2 - 32}" y="${(y1 + y2) / 2 - 10}">斜长 ${calcNumber(travel, 0)}</text>
      <circle class="diagram-point" cx="${x1}" cy="${y1}" r="5"/><circle class="diagram-point" cx="${x2}" cy="${y2}" r="5"/>
    `;
  }

  function updateElbowCalculator() {
    const dn = Math.max(1, calcValue('elbowDn', 100));
    const type = document.getElementById('elbowRadiusType').value;
    const customInput = document.getElementById('elbowCustomRadius');
    customInput.disabled = type !== 'custom';
    const radius = type === 'custom' ? Math.max(1, calcValue('elbowCustomRadius', dn * 1.5)) : dn * Number(type);
    const angle = Math.max(1, Math.min(179, calcValue('elbowAngle', 90)));
    const distance = Math.max(0, calcValue('elbowCenterDistance'));
    const radians = angle * Math.PI / 180;
    const tangent = radius * Math.tan(radians / 2);
    const arc = radius * radians;
    const chord = 2 * radius * Math.sin(radians / 2);
    const straight = distance - tangent * 2;

    document.getElementById('elbowRadiusResult').textContent = `${calcNumber(radius)} mm`;
    document.getElementById('elbowTangentResult').textContent = `${calcNumber(tangent)} mm`;
    document.getElementById('elbowArcResult').textContent = `${calcNumber(arc)} mm`;
    document.getElementById('elbowChordResult').textContent = `${calcNumber(chord)} mm`;
    document.getElementById('elbowStraightResult').textContent = `${calcNumber(Math.max(0, straight))} mm`;
    document.getElementById('elbowError').textContent = straight < 0 ? '给定的两理论交点距离小于两只弯头的切线占用，无法放入中间直管。' : '';

    const visualRadius = 105;
    const cx = 210, cy = 230;
    const startAngle = Math.PI;
    const endAngle = Math.PI + radians;
    const sx = cx + visualRadius * Math.cos(startAngle), sy = cy + visualRadius * Math.sin(startAngle);
    const ex = cx + visualRadius * Math.cos(endAngle), ey = cy + visualRadius * Math.sin(endAngle);
    const tangentScale = 95;
    const endTangentX = ex + Math.cos(endAngle + Math.PI / 2) * tangentScale;
    const endTangentY = ey + Math.sin(endAngle + Math.PI / 2) * tangentScale;
    document.getElementById('elbowDiagram').innerHTML = `
      <title>弯头中心半径与切线示意</title><desc>显示弯头圆心、中心半径、转角和两端切线</desc>
      <text x="28" y="30">DN ${calcNumber(dn, 0)} · R ${calcNumber(radius, 0)} · ${calcNumber(angle, 1)}°</text>
      <line class="diagram-main" x1="35" y1="${sy}" x2="${sx}" y2="${sy}"/>
      <path class="diagram-main" d="M ${sx} ${sy} A ${visualRadius} ${visualRadius} 0 0 0 ${ex} ${ey}"/>
      <line class="diagram-main" x1="${ex}" y1="${ey}" x2="${endTangentX}" y2="${endTangentY}"/>
      <line class="diagram-grid" x1="${cx}" y1="${cy}" x2="${sx}" y2="${sy}"/><line class="diagram-grid" x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}"/>
      <circle class="diagram-point" cx="${cx}" cy="${cy}" r="4"/><text class="diagram-muted" x="${cx + 8}" y="${cy + 18}">圆心</text>
      <text class="diagram-muted" x="${(cx + sx) / 2 - 12}" y="${sy - 10}">R</text>
      <text class="diagram-muted" x="340" y="85">切线长 ${calcNumber(tangent, 0)}</text>
      <text class="diagram-muted" x="340" y="115">弧长 ${calcNumber(arc, 0)}</text>
      <text class="diagram-muted" x="340" y="145">弦长 ${calcNumber(chord, 0)}</text>
    `;
  }

  function updateClosureCalculator() {
    const mode = document.getElementById('closureMode').value;
    const e = calcValue('closureDeltaE');
    const nn = calcValue('closureDeltaN');
    const z = calcValue('closureDeltaZ');
    const takeoutA = Math.max(0, calcValue('closureTakeoutA'));
    const takeoutB = Math.max(0, calcValue('closureTakeoutB'));
    const gap = Math.max(0, calcValue('closureGap'));
    const trimInput = document.getElementById('closureTrim');
    trimInput.disabled = mode === 'dead';
    const trim = mode === 'live' ? Math.max(0, calcValue('closureTrim')) : 0;
    const plan = Math.hypot(e, nn);
    const distance = Math.hypot(e, nn, z);
    const bearing = plan > 0 ? (Math.atan2(nn, e) * 180 / Math.PI + 360) % 360 : 0;
    const slope = plan > 0 ? Math.atan2(z, plan) * 180 / Math.PI : (z >= 0 ? 90 : -90);
    const net = distance - takeoutA - takeoutB - gap;
    const blank = net + trim;

    document.getElementById('closureDistanceResult').textContent = `${calcNumber(distance)} mm`;
    document.getElementById('closureAnglesResult').textContent = `${calcNumber(bearing, 2)}° / ${calcNumber(slope, 2)}°`;
    document.getElementById('closureNetResult').textContent = `${calcNumber(Math.max(0, net))} mm`;
    document.getElementById('closureBlankResult').textContent = `${calcNumber(Math.max(0, blank))} mm`;
    document.getElementById('closureError').textContent = net < 0 ? '两端占用与焊口间隙已经超过接口中心距离，请检查测量值和扣除值。' : '';

    const scale = 380 / Math.max(distance, 1);
    const ax = 95, ay = 245;
    const bx = ax + Math.max(150, plan * scale), by = ay - z * scale;
    const safeBx = Math.min(520, bx), safeBy = Math.max(70, Math.min(270, by));
    const ratioA = Math.min(0.35, distance > 0 ? takeoutA / distance : 0);
    const ratioB = Math.min(0.35, distance > 0 ? takeoutB / distance : 0);
    const aEndX = ax + (safeBx - ax) * ratioA, aEndY = ay + (safeBy - ay) * ratioA;
    const bStartX = safeBx - (safeBx - ax) * ratioB, bStartY = safeBy - (safeBy - ay) * ratioB;
    document.getElementById('closureDiagram').innerHTML = `
      <title>${mode === 'dead' ? '死口' : '活口'}闭合管段示意</title><desc>显示两个接口中心、端部占用和中间净下料长度</desc>
      <text x="28" y="30">${mode === 'dead' ? '死口 · 两端固定' : '活口 · 一端可调'}</text>
      <line class="diagram-grid" x1="${ax}" y1="${ay}" x2="${safeBx}" y2="${safeBy}"/>
      <line class="diagram-accent" x1="${ax}" y1="${ay}" x2="${aEndX}" y2="${aEndY}"/>
      <line class="diagram-main" x1="${aEndX}" y1="${aEndY}" x2="${bStartX}" y2="${bStartY}"/>
      <line class="diagram-accent" x1="${bStartX}" y1="${bStartY}" x2="${safeBx}" y2="${safeBy}"/>
      <circle class="diagram-point" cx="${ax}" cy="${ay}" r="6"/><circle class="diagram-point" cx="${safeBx}" cy="${safeBy}" r="6"/>
      <text x="${ax - 8}" y="${ay + 24}">A</text><text x="${safeBx + 8}" y="${safeBy - 8}">B</text>
      <text class="diagram-muted" x="${(ax + safeBx) / 2 - 50}" y="${(ay + safeBy) / 2 - 15}">中心真距 ${calcNumber(distance, 0)}</text>
      <text class="diagram-muted" x="55" y="305">橙色：两端管件占用 · 蓝色：闭合直管</text>
    `;
  }

  function updateMiterCalculator() {
    const total = Math.max(1, Math.min(180, calcValue('miterTotalAngle', 90)));
    const pieces = Math.max(2, Math.min(8, Math.round(calcValue('miterPieceCount', 3))));
    const diameter = Math.max(1, calcValue('miterDiameter', 1));
    const joints = pieces - 1;
    const jointAngle = total / joints;
    const cutAngle = jointAngle / 2;
    const cutback = diameter * Math.tan(cutAngle * Math.PI / 180);

    document.getElementById('miterJointResult').textContent = `${joints} 道`;
    document.getElementById('miterJointAngleResult').textContent = `${calcNumber(jointAngle, 2)}°`;
    document.getElementById('miterCutAngleResult').textContent = `${calcNumber(cutAngle, 2)}°`;
    document.getElementById('miterCutbackResult').textContent = `${calcNumber(cutback)} mm`;

    const raw = [{ x: 0, y: 0 }];
    const seg = 90;
    for (let i = 0; i < pieces; i++) {
      const heading = -i * jointAngle * Math.PI / 180;
      const prev = raw[raw.length - 1];
      raw.push({ x: prev.x + Math.cos(heading) * seg, y: prev.y + Math.sin(heading) * seg });
    }
    const xs = raw.map((p) => p.x), ys = raw.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const scale = Math.min(500 / Math.max(maxX - minX, 1), 220 / Math.max(maxY - minY, 1));
    const pts = raw.map((p) => ({ x: 60 + (p.x - minX) * scale, y: 270 - (p.y - minY) * scale }));
    const path = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const cuts = pts.slice(1, -1).map((p, index) => {
      const before = raw[index + 1], after = raw[index + 2];
      const bisector = (Math.atan2(after.y - before.y, after.x - before.x) + Math.atan2(before.y - raw[index].y, before.x - raw[index].x)) / 2;
      const dx = Math.cos(bisector + Math.PI / 2) * 26;
      const dy = -Math.sin(bisector + Math.PI / 2) * 26;
      return `<line class="diagram-accent" x1="${p.x - dx}" y1="${p.y - dy}" x2="${p.x + dx}" y2="${p.y + dy}"/><text class="diagram-muted" x="${p.x + 8}" y="${p.y - 12}">缝${index + 1}</text>`;
    }).join('');
    document.getElementById('miterDiagram').innerHTML = `
      <title>等角斜接弯头示意</title><desc>${pieces}节管组成${calcNumber(total, 0)}度转角，每个接缝转角相等</desc>
      <text x="28" y="30">${pieces} 节 · 总转角 ${calcNumber(total, 1)}°</text>
      <polyline class="diagram-main" points="${path}"/>${cuts}
      ${pts.map((p, i) => `<circle class="diagram-point" cx="${p.x}" cy="${p.y}" r="5"/><text class="diagram-muted" x="${p.x + 7}" y="${p.y + 18}">P${i}</text>`).join('')}
      <text class="diagram-muted" x="28" y="310">每道接缝转角 ${calcNumber(jointAngle, 2)}° · 每个配对端面切割 ${calcNumber(cutAngle, 2)}°</text>
    `;
  }

  function saddleDepth(headerRadius, branchRadius, angleDegrees) {
    const radians = angleDegrees * Math.PI / 180;
    const lateral = branchRadius * Math.sin(radians);
    return headerRadius - Math.sqrt(Math.max(0, headerRadius * headerRadius - lateral * lateral));
  }

  function updateSaddleCalculator() {
    const headerDiameter = Math.max(1, calcValue('saddleHeaderDiameter', 1));
    const branchDiameter = Math.max(1, calcValue('saddleBranchDiameter', 1));
    const error = document.getElementById('saddleError');
    if (branchDiameter > headerDiameter) {
      error.textContent = '支管外径不能大于主管外径；这种结构需要另一套相贯几何。';
      document.getElementById('saddleCircResult').textContent = '—';
      document.getElementById('saddleDepthResult').textContent = '—';
      document.getElementById('saddleDiagram').innerHTML = '<title>输入尺寸无效</title><text x="45" y="165">请将支管外径设置为不大于主管外径</text>';
      [0, 15, 30, 45, 60, 75, 90].forEach((angle) => document.getElementById(`saddlePoint${angle}`).textContent = '—');
      return;
    }
    error.textContent = '';
    const headerRadius = headerDiameter / 2;
    const branchRadius = branchDiameter / 2;
    const circumference = Math.PI * branchDiameter;
    const maxDepth = saddleDepth(headerRadius, branchRadius, 90);
    document.getElementById('saddleCircResult').textContent = `${calcNumber(circumference)} mm`;
    document.getElementById('saddleDepthResult').textContent = `${calcNumber(maxDepth)} mm`;
    [0, 15, 30, 45, 60, 75, 90].forEach((angle) => {
      document.getElementById(`saddlePoint${angle}`).textContent = calcNumber(saddleDepth(headerRadius, branchRadius, angle));
    });

    const samples = Array.from({ length: 73 }, (_, index) => {
      const angle = index * 5;
      return { angle, depth: saddleDepth(headerRadius, branchRadius, angle) };
    });
    const baseY = 70, chartHeight = 190;
    const path = samples.map((point, index) => {
      const x = 55 + point.angle / 360 * 520;
      const y = baseY + (maxDepth ? point.depth / maxDepth : 0) * chartHeight;
      return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    const guides = [0, 90, 180, 270, 360].map((angle) => {
      const x = 55 + angle / 360 * 520;
      return `<line class="diagram-grid" x1="${x}" y1="${baseY}" x2="${x}" y2="${baseY + chartHeight}"/><text class="diagram-muted" x="${x - 10}" y="${baseY + chartHeight + 22}">${angle}°</text>`;
    }).join('');
    document.getElementById('saddleDiagram').innerHTML = `
      <title>90度马鞍口圆周展开曲线</title><desc>横轴为支管圆周角，纵向为从最高切口向内的理论放样深度</desc>
      <text x="30" y="30">支管圆周展开</text><text class="diagram-muted" x="365" y="30">最大深度 ${calcNumber(maxDepth)} mm</text>
      <line class="diagram-axis" x1="55" y1="${baseY}" x2="575" y2="${baseY}"/>${guides}
      <path class="diagram-main" d="${path}"/>
      <text class="diagram-muted" x="55" y="312">圆周角从最高切口起算 · 曲线左右对称</text>
    `;
  }

  function updateCompareCalculator() {
    const oldVector = [calcValue('compareOldE'), calcValue('compareOldN'), calcValue('compareOldZ')];
    const newVector = [calcValue('compareNewE'), calcValue('compareNewN'), calcValue('compareNewZ')];
    const oldLength = Math.hypot(...oldVector);
    const newLength = Math.hypot(...newVector);
    const diff = newVector.map((value, index) => value - oldVector[index]);
    document.getElementById('compareOldLength').textContent = `${calcNumber(oldLength)} mm`;
    document.getElementById('compareNewLength').textContent = `${calcNumber(newLength)} mm`;
    document.getElementById('compareLengthDiff').textContent = `${diff[0] || diff[1] || diff[2] ? (newLength - oldLength >= 0 ? '+' : '') : ''}${calcNumber(newLength - oldLength)} mm`;
    document.getElementById('compareEndDiff').textContent = `${diff.map((value) => `${value >= 0 ? '+' : ''}${calcNumber(value, 0)}`).join(' / ')} mm`;

    const planMax = Math.max(Math.abs(oldVector[0]), Math.abs(oldVector[1]), Math.abs(newVector[0]), Math.abs(newVector[1]), 1);
    const planScale = 105 / planMax;
    const ox = 165, oy = 170;
    const oldPx = ox + oldVector[0] * planScale, oldPy = oy - oldVector[1] * planScale;
    const newPx = ox + newVector[0] * planScale, newPy = oy - newVector[1] * planScale;
    const oldPlan = Math.hypot(oldVector[0], oldVector[1]);
    const newPlan = Math.hypot(newVector[0], newVector[1]);
    const sideMax = Math.max(oldPlan, newPlan, Math.abs(oldVector[2]), Math.abs(newVector[2]), 1);
    const sideScale = 180 / sideMax;
    const sx = 370, sy = 245;
    const oldSx = sx + oldPlan * sideScale, oldSy = sy - oldVector[2] * sideScale;
    const newSx = sx + newPlan * sideScale, newSy = sy - newVector[2] * sideScale;
    document.getElementById('compareDiagram').innerHTML = `
      <title>旧管实测与新设计对比</title><desc>虚线为旧管，实线为新设计，分别显示平面和立面差异</desc>
      <text x="28" y="28">平面对比</text><text x="345" y="28">立面对比</text>
      <line class="diagram-axis" x1="35" y1="${oy}" x2="295" y2="${oy}"/><line class="diagram-axis" x1="${ox}" y1="45" x2="${ox}" y2="290"/>
      <line class="diagram-old" x1="${ox}" y1="${oy}" x2="${oldPx}" y2="${oldPy}"/><line class="diagram-main" x1="${ox}" y1="${oy}" x2="${newPx}" y2="${newPy}"/>
      <circle class="diagram-point" cx="${oldPx}" cy="${oldPy}" r="5"/><circle class="diagram-point" cx="${newPx}" cy="${newPy}" r="5"/>
      <line class="diagram-accent" x1="${oldPx}" y1="${oldPy}" x2="${newPx}" y2="${newPy}"/>
      <line class="diagram-axis" x1="${sx}" y1="${sy}" x2="590" y2="${sy}"/><line class="diagram-axis" x1="${sx}" y1="45" x2="${sx}" y2="285"/>
      <line class="diagram-old" x1="${sx}" y1="${sy}" x2="${oldSx}" y2="${oldSy}"/><line class="diagram-main" x1="${sx}" y1="${sy}" x2="${newSx}" y2="${newSy}"/>
      <line class="diagram-accent" x1="${oldSx}" y1="${oldSy}" x2="${newSx}" y2="${newSy}"/>
      <line class="diagram-old" x1="38" y1="306" x2="78" y2="306"/><text class="diagram-muted" x="85" y="310">旧管实测</text><line class="diagram-main" x1="165" y1="306" x2="205" y2="306"/><text class="diagram-muted" x="212" y="310">新设计</text>
    `;
  }

  function initCalculators() {
    document.querySelectorAll('.calc-tab').forEach((button) => button.addEventListener('click', () => {
      const mode = button.dataset.calcMode;
      document.querySelectorAll('.calc-tab').forEach((item) => item.classList.toggle('is-active', item === button));
      document.querySelectorAll('.calc-panel').forEach((panel) => {
        const active = panel.id === `calc-${mode}`;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    }));
    ['calcDeltaE', 'calcDeltaN', 'calcDeltaZ', 'quickOffset', 'quickOffsetAngle'].forEach((id) => document.getElementById(id).addEventListener('input', updateAngleCalculator));
    ['returnOffset', 'returnAngle', 'returnRadius'].forEach((id) => document.getElementById(id).addEventListener('input', updateReturnCalculator));
    ['elbowDn', 'elbowRadiusType', 'elbowAngle', 'elbowCustomRadius', 'elbowCenterDistance'].forEach((id) => {
      document.getElementById(id).addEventListener(id === 'elbowRadiusType' ? 'change' : 'input', updateElbowCalculator);
    });
    ['closureMode', 'closureDeltaE', 'closureDeltaN', 'closureDeltaZ', 'closureTakeoutA', 'closureTakeoutB', 'closureGap', 'closureTrim'].forEach((id) => {
      document.getElementById(id).addEventListener(id === 'closureMode' ? 'change' : 'input', updateClosureCalculator);
    });
    ['miterTotalAngle', 'miterPieceCount', 'miterDiameter'].forEach((id) => document.getElementById(id).addEventListener('input', updateMiterCalculator));
    ['saddleHeaderDiameter', 'saddleBranchDiameter'].forEach((id) => document.getElementById(id).addEventListener('input', updateSaddleCalculator));
    ['compareOldE', 'compareOldN', 'compareOldZ', 'compareNewE', 'compareNewN', 'compareNewZ'].forEach((id) => document.getElementById(id).addEventListener('input', updateCompareCalculator));
    updateAngleCalculator();
    updateReturnCalculator();
    updateElbowCalculator();
    updateClosureCalculator();
    updateMiterCalculator();
    updateSaddleCalculator();
    updateCompareCalculator();
  }

  function formatQuickNumber(value) {
    if (!Number.isFinite(value)) return '无法计算';
    const abs = Math.abs(value);
    if (abs !== 0 && (abs >= 1e10 || abs < 1e-7)) return value.toExponential(8);
    return Number(value.toFixed(8)).toLocaleString('zh-CN', { maximumFractionDigits: 8 });
  }

  function saveQuickHistory() {
    writeJson(profileKey('pipe-quick-history'), quickCalcHistory.slice(0, 20));
  }

  function renderQuickHistory() {
    const container = document.getElementById('quickHistoryList');
    if (!container) return;
    container.innerHTML = quickCalcHistory.length ? quickCalcHistory.slice(0, 8).map((item, index) => `<div class="quick-history-row"><span>${escapeHtml(item.expression)} = ${escapeHtml(item.result)}</span><button type="button" data-history-index="${index}">使用</button></div>`).join('') : '<div class="profile-empty">暂无计算记录。</div>';
  }

  function configureQuickParser() {
    quickCalcParser = new window.ExprEval.Parser({ operators: { logical: false, comparison: false, 'in': false, assignment: false, concatenate: false, conditional: false } });
    const toRadians = (value) => quickCalcAngleMode === 'DEG' ? value * Math.PI / 180 : value;
    const fromRadians = (value) => quickCalcAngleMode === 'DEG' ? value * 180 / Math.PI : value;
    const trigFunctions = {
      sin: (value) => Math.sin(toRadians(value)), cos: (value) => Math.cos(toRadians(value)), tan: (value) => Math.tan(toRadians(value)),
      asin: (value) => fromRadians(Math.asin(value)), acos: (value) => fromRadians(Math.acos(value)), atan: (value) => fromRadians(Math.atan(value))
    };
    Object.entries(trigFunctions).forEach(([name, fn]) => {
      quickCalcParser.functions[name] = fn;
      quickCalcParser.unaryOps[name] = fn;
    });
  }

  function evaluateQuickExpression(addHistory = false) {
    const input = document.getElementById('quickExpression');
    const output = document.getElementById('quickResult');
    const expression = input.value.trim();
    if (!expression) {
      output.textContent = '-';
      quickCalcLastResult = null;
      return;
    }
    try {
      configureQuickParser();
      const value = Number(quickCalcParser.evaluate(expression));
      if (!Number.isFinite(value)) throw new Error('结果不是有限数值');
      quickCalcLastResult = value;
      const formatted = formatQuickNumber(value);
      output.textContent = formatted;
      if (addHistory) {
        quickCalcHistory = [{ expression, result: formatted, value }, ...quickCalcHistory.filter((item) => item.expression !== expression)].slice(0, 20);
        saveQuickHistory();
        renderQuickHistory();
      }
    } catch (error) {
      output.textContent = '表达式有误';
      quickCalcLastResult = null;
    }
  }

  function updateCircleQuickCalc() {
    const type = document.getElementById('circleKnownType').value;
    const value = Math.max(0, Number(document.getElementById('circleKnownValue').value) || 0);
    const radius = type === 'radius' ? value : type === 'diameter' ? value / 2 : value / (2 * Math.PI);
    const diameter = radius * 2;
    const circumference = radius * 2 * Math.PI;
    const area = Math.PI * radius * radius;
    document.getElementById('circleRadiusResult').textContent = `${formatQuickNumber(radius)} mm`;
    document.getElementById('circleDiameterResult').textContent = `${formatQuickNumber(diameter)} mm`;
    document.getElementById('circleCircResult').textContent = `${formatQuickNumber(circumference)} mm`;
    document.getElementById('circleAreaResult').textContent = `${formatQuickNumber(area)} mm²`;
    quickCalcLastResult = circumference;
  }

  function updateTriangleQuickCalc() {
    const a = Math.max(0, Number(document.getElementById('triangleA').value) || 0);
    const b = Math.max(0, Number(document.getElementById('triangleB').value) || 0);
    const c = Math.hypot(a, b);
    const angleA = c ? Math.asin(a / c) * 180 / Math.PI : 0;
    const angleB = 90 - angleA;
    document.getElementById('triangleCResult').textContent = `${formatQuickNumber(c)} mm`;
    document.getElementById('triangleAngleAResult').textContent = `${formatQuickNumber(angleA)}°`;
    document.getElementById('triangleAngleBResult').textContent = `${formatQuickNumber(angleB)}°`;
    document.getElementById('triangleAreaResult').textContent = `${formatQuickNumber(a * b / 2)} mm²`;
    quickCalcLastResult = c;
  }

  function updatePipeQuickCalc() {
    const od = Math.max(0, Number(document.getElementById('pipeCalcOd').value) || 0);
    const thickness = Math.max(0, Number(document.getElementById('pipeCalcThickness').value) || 0);
    const length = Math.max(0, Number(document.getElementById('pipeCalcLength').value) || 0);
    const density = Math.max(0, Number(document.getElementById('pipeCalcDensity').value) || 0);
    const id = Math.max(0, od - thickness * 2);
    const circumference = Math.PI * od;
    const surface = Math.PI * (od / 1000) * length;
    const volumeLiters = Math.PI / 4 * Math.pow(id / 1000, 2) * length * 1000;
    const metalVolume = Math.PI / 4 * (od * od - id * id) * 1e-6 * length;
    const weight = metalVolume * density;
    document.getElementById('pipeCalcCircResult').textContent = `${formatQuickNumber(circumference)} mm`;
    document.getElementById('pipeCalcSurfaceResult').textContent = `${formatQuickNumber(surface)} m²`;
    document.getElementById('pipeCalcVolumeResult').textContent = `${formatQuickNumber(volumeLiters)} L`;
    document.getElementById('pipeCalcWeightResult').textContent = `${formatQuickNumber(weight)} kg`;
    quickCalcLastResult = circumference;
  }

  const unitDefinitions = {
    length: { mm: 0.001, cm: 0.01, m: 1, in: 0.0254, ft: 0.3048 },
    pressure: { Pa: 1, kPa: 1000, MPa: 1000000, bar: 100000, psi: 6894.757293 }
  };

  function populateUnitOptions() {
    const category = document.getElementById('unitCategory').value;
    const units = Object.keys(unitDefinitions[category]);
    const from = document.getElementById('unitFrom');
    const to = document.getElementById('unitTo');
    const previousFrom = from.value, previousTo = to.value;
    from.innerHTML = units.map((unit) => `<option value="${unit}">${unit}</option>`).join('');
    to.innerHTML = units.map((unit) => `<option value="${unit}">${unit}</option>`).join('');
    from.value = units.includes(previousFrom) ? previousFrom : units[0];
    to.value = units.includes(previousTo) ? previousTo : units[Math.min(2, units.length - 1)];
    updateUnitQuickCalc();
  }

  function updateUnitQuickCalc() {
    const category = document.getElementById('unitCategory').value;
    const value = Number(document.getElementById('unitValue').value) || 0;
    const from = document.getElementById('unitFrom').value;
    const to = document.getElementById('unitTo').value;
    if (!from || !to) return;
    const result = value * unitDefinitions[category][from] / unitDefinitions[category][to];
    quickCalcLastResult = result;
    document.getElementById('unitResult').textContent = `${formatQuickNumber(result)} ${to}`;
  }

  function openQuickCalculator() {
    document.getElementById('quickCalcOverlay').hidden = false;
    document.getElementById('quickCalcDrawer').hidden = false;
    document.body.classList.add('quick-calc-open');
    setTimeout(() => document.getElementById('quickExpression').focus(), 0);
  }

  function closeQuickCalculator() {
    document.getElementById('quickCalcOverlay').hidden = true;
    document.getElementById('quickCalcDrawer').hidden = true;
    document.body.classList.remove('quick-calc-open');
  }

  function initQuickCalculator() {
    if (!window.ExprEval?.Parser) throw new Error('Expression parser failed to load');
    document.addEventListener('focusin', (event) => {
      if (event.target.matches('input[type="number"]') && !event.target.closest('#quickCalcDrawer')) lastFocusedNumericInput = event.target;
    });
    document.getElementById('quickCalcBtn').addEventListener('click', openQuickCalculator);
    document.getElementById('quickCalcCloseBtn').addEventListener('click', closeQuickCalculator);
    document.getElementById('quickCalcOverlay').addEventListener('click', closeQuickCalculator);
    document.querySelectorAll('[data-qcalc-mode]').forEach((button) => button.addEventListener('click', () => {
      const mode = button.dataset.qcalcMode;
      document.querySelectorAll('[data-qcalc-mode]').forEach((item) => item.classList.toggle('is-active', item === button));
      document.querySelectorAll('.qcalc-panel').forEach((panel) => {
        const active = panel.id === `qcalc-${mode}`;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    }));
    document.getElementById('quickExpression').addEventListener('input', () => evaluateQuickExpression(false));
    document.getElementById('quickExpression').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') evaluateQuickExpression(true);
    });
    document.querySelector('.quick-keypad').addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const input = document.getElementById('quickExpression');
      if (button.dataset.calcKey !== undefined) {
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? start;
        input.value = input.value.slice(0, start) + button.dataset.calcKey + input.value.slice(end);
        input.setSelectionRange(start + button.dataset.calcKey.length, start + button.dataset.calcKey.length);
        evaluateQuickExpression(false);
      } else if (button.dataset.calcAction === 'clear') {
        input.value = '';
        evaluateQuickExpression(false);
      } else if (button.dataset.calcAction === 'backspace') {
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? start;
        input.value = start === end ? input.value.slice(0, Math.max(0, start - 1)) + input.value.slice(end) : input.value.slice(0, start) + input.value.slice(end);
        evaluateQuickExpression(false);
      } else if (button.dataset.calcAction === 'percent') {
        input.value = input.value.trim() ? `(${input.value})/100` : '0';
        evaluateQuickExpression(false);
      } else if (button.dataset.calcAction === 'equals') evaluateQuickExpression(true);
      input.focus();
    });
    document.getElementById('quickAngleModeBtn').addEventListener('click', (event) => {
      quickCalcAngleMode = quickCalcAngleMode === 'DEG' ? 'RAD' : 'DEG';
      event.target.textContent = quickCalcAngleMode;
      evaluateQuickExpression(false);
    });
    document.getElementById('quickHistoryList').addEventListener('click', (event) => {
      const button = event.target.closest('[data-history-index]');
      if (!button) return;
      document.getElementById('quickExpression').value = quickCalcHistory[Number(button.dataset.historyIndex)].expression;
      evaluateQuickExpression(false);
    });
    ['circleKnownType', 'circleKnownValue'].forEach((id) => document.getElementById(id).addEventListener(id === 'circleKnownType' ? 'change' : 'input', updateCircleQuickCalc));
    ['triangleA', 'triangleB'].forEach((id) => document.getElementById(id).addEventListener('input', updateTriangleQuickCalc));
    ['pipeCalcOd', 'pipeCalcThickness', 'pipeCalcLength', 'pipeCalcDensity'].forEach((id) => document.getElementById(id).addEventListener('input', updatePipeQuickCalc));
    document.getElementById('unitCategory').addEventListener('change', populateUnitOptions);
    ['unitValue', 'unitFrom', 'unitTo'].forEach((id) => document.getElementById(id).addEventListener(id === 'unitValue' ? 'input' : 'change', updateUnitQuickCalc));
    document.getElementById('quickCopyBtn').addEventListener('click', () => {
      if (quickCalcLastResult === null) return;
      navigator.clipboard?.writeText(String(quickCalcLastResult)).catch(() => {});
    });
    document.getElementById('quickFillBtn').addEventListener('click', () => {
      if (quickCalcLastResult === null || !lastFocusedNumericInput) return;
      lastFocusedNumericInput.value = Number(quickCalcLastResult.toFixed(8));
      lastFocusedNumericInput.dispatchEvent(new Event('input', { bubbles: true }));
      lastFocusedNumericInput.dispatchEvent(new Event('change', { bubbles: true }));
      closeQuickCalculator();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !document.getElementById('quickCalcDrawer').hidden) closeQuickCalculator();
    });
    configureQuickParser();
    evaluateQuickExpression(false);
    updateCircleQuickCalc();
    updateTriangleQuickCalc();
    updatePipeQuickCalc();
    populateUnitOptions();
    renderQuickHistory();
  }

  function updateMobileNavigation(page) {
    document.querySelectorAll('[data-mobile-page]').forEach((button) => button.classList.toggle('is-active', button.dataset.mobilePage === page));
  }

  function initMobileNavigation() {
    document.querySelectorAll('[data-mobile-page]').forEach((button) => button.addEventListener('click', () => {
      const target = document.querySelector(`[data-page="${button.dataset.mobilePage}"]`);
      if (target) target.click();
    }));
    updateMobileNavigation('trainer');

    // 触摸手势支持 - 在3D视图上滑动切换段落
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    const swipeThreshold = 50;
    const swipeTimeLimit = 300;

    els.viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    els.viewport.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      // 只处理水平滑动（排除垂直滑动和点击）
      if (deltaTime < swipeTimeLimit && Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX > 0) {
          selectSegment((selectedSegment - 1 + state.segments.length) % state.segments.length);
        } else {
          selectSegment((selectedSegment + 1) % state.segments.length);
        }
      }
    }, { passive: true });
  }

  function refreshThreeLayout() {
    setTimeout(() => {
      resizeThree();
      fitCamera();
    }, 80);
  }

  function applyTrainingLayout() {
    const trainerActive = document.getElementById('page-trainer').classList.contains('is-active');
    const autoLandscape = window.innerWidth > window.innerHeight && window.innerHeight <= 650;
    const manualReady = manualLandscapeMode && (window.innerWidth > window.innerHeight || window.innerWidth >= 700);
    const active = trainerActive && (autoLandscape || manualReady);
    document.body.classList.toggle('training-landscape', active);
    document.body.classList.toggle('hide-data-panel', active && !dataPanelVisible);
    document.body.classList.toggle('hide-drawing-panel', active && !drawingPanelVisible);

    const button = document.getElementById('landscapeBtn');
    button.setAttribute('aria-pressed', String(active || manualLandscapeMode));
    button.textContent = active ? '↺ 竖屏' : (manualLandscapeMode ? '↻ 请横放' : '↻ 横屏');
    button.title = active ? '退出横屏训练' : '进入横屏训练；浏览器中请开启自动旋转并横放手机';
    refreshThreeLayout();
  }

  function requestDeviceOrientation(landscape) {
    const value = landscape ? 'landscape-primary' : 'portrait-primary';
    if (window.plus && plus.screen) {
      plus.screen.lockOrientation(value);
      return;
    }
    if (window.screen && screen.orientation && screen.orientation.lock) {
      screen.orientation.lock(value).catch(() => {});
    }
  }

  function initThemeToggle() {
    const themeBtn = getCachedElement('themeToggleBtn');
    if (!themeBtn) return;

    // 读取保存的主题设置
    const savedTheme = localStorage.getItem('pipe-theme') || 'light';
    const isDark = savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeBtn.setAttribute('aria-pressed', 'true');
    }

    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeBtn.setAttribute('aria-pressed', 'true');
        localStorage.setItem('pipe-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        themeBtn.setAttribute('aria-pressed', 'false');
        localStorage.setItem('pipe-theme', 'light');
      }

      // 更新 Three.js 场景背景
      if (scene) {
        scene.background = new THREE.Color(newTheme === 'dark' ? 0x161b20 : 0xedf0f1);
        markDirty();
      }
    });
  }

  function initCollapsiblePanels() {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('pipe-collapsed-sections') || '[]');
    } catch (error) {
      saved = [];
    }
    const sectionNames = ['cases', 'start', 'segments', 'quiz'];
    document.querySelectorAll('.builder-panel .panel-section').forEach((section, index) => {
      const heading = section.querySelector('.section-heading');
      if (!heading) return;
      const key = sectionNames[index] || `section-${index}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'collapse-section-btn';
      button.setAttribute('aria-label', '折叠或展开本区');
      const setCollapsed = (collapsed) => {
        section.classList.toggle('is-collapsed', collapsed);
        button.textContent = collapsed ? '+' : '−';
        button.setAttribute('aria-expanded', String(!collapsed));
      };
      setCollapsed(saved.includes(key));
      button.addEventListener('click', () => {
        const collapsed = !section.classList.contains('is-collapsed');
        setCollapsed(collapsed);
        const values = Array.from(document.querySelectorAll('.builder-panel .panel-section')).map((item, itemIndex) => item.classList.contains('is-collapsed') ? (sectionNames[itemIndex] || `section-${itemIndex}`) : null).filter(Boolean);
        localStorage.setItem('pipe-collapsed-sections', JSON.stringify(values));
        refreshThreeLayout();
      });
      heading.appendChild(button);
    });
  }

  function initLandscapeControls() {
    document.getElementById('landscapeBtn').addEventListener('click', () => {
      const entering = !(manualLandscapeMode || document.body.classList.contains('training-landscape'));
      manualLandscapeMode = entering;
      if (entering) document.querySelector('[data-page="trainer"]').click();
      requestDeviceOrientation(entering);
      applyTrainingLayout();
    });
    document.getElementById('toggleDataPanelBtn').addEventListener('click', () => {
      dataPanelVisible = !dataPanelVisible;
      const button = document.getElementById('toggleDataPanelBtn');
      button.classList.toggle('is-active', dataPanelVisible);
      button.setAttribute('aria-pressed', String(dataPanelVisible));
      applyTrainingLayout();
    });
    document.getElementById('toggleDrawingPanelBtn').addEventListener('click', () => {
      drawingPanelVisible = !drawingPanelVisible;
      const button = document.getElementById('toggleDrawingPanelBtn');
      button.classList.toggle('is-active', drawingPanelVisible);
      button.setAttribute('aria-pressed', String(drawingPanelVisible));
      applyTrainingLayout();
    });
    window.addEventListener('resize', applyTrainingLayout);
    window.addEventListener('orientationchange', applyTrainingLayout);
    document.addEventListener('plusready', applyTrainingLayout, false);
    applyTrainingLayout();
  }

  function bindEvents() {
    ['startE', 'startN', 'startZ', 'pipeDn'].forEach((id) => {
      document.getElementById(id).addEventListener('input', () => {
        state.start = [n(els.startE.value), n(els.startN.value), n(els.startZ.value)];
        state.dn = Math.max(15, n(els.pipeDn.value, 100));
        quizActive = false;
        updateAll();
      });
    });
    document.getElementById('addSegmentBtn').addEventListener('click', () => {
      state.segments.push({ dir: 'E', length: 500 });
      selectedSegment = state.segments.length - 1;
      quizActive = false;
      updateAll();
    });
    document.getElementById('resetBtn').addEventListener('click', () => setPreset(activePreset));
    document.querySelectorAll('.preset-btn').forEach((btn) => btn.addEventListener('click', () => setPreset(btn.dataset.preset)));
    document.querySelectorAll('.view-btn').forEach((btn) => btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      document.querySelectorAll('.view-btn').forEach((item) => item.classList.toggle('is-active', item === btn));
      fitCamera(currentView);
    }));
    document.getElementById('fitViewBtn').addEventListener('click', () => fitCamera());
    document.getElementById('shadowToggle').addEventListener('change', (event) => {
      shadowGroup.visible = event.target.checked;
      markDirty();
    });
    document.getElementById('labelToggle').addEventListener('change', positionCoordLabels);
    document.getElementById('prevStepBtn').addEventListener('click', () => selectSegment((selectedSegment - 1 + state.segments.length) % state.segments.length));
    document.getElementById('nextStepBtn').addEventListener('click', () => selectSegment((selectedSegment + 1) % state.segments.length));
    document.getElementById('randomBtn').addEventListener('click', randomChallenge);
    document.getElementById('checkAnswerBtn').addEventListener('click', checkAnswer);
    document.getElementById('revealBtn').addEventListener('click', () => {
      quizActive = false;
      updateVisualsOnly();
    });
    document.querySelectorAll('.top-tab').forEach((tab) => tab.addEventListener('click', () => {
      const page = tab.dataset.page;
      document.querySelectorAll('.top-tab').forEach((item) => item.classList.toggle('is-active', item === tab));
      document.querySelectorAll('.page').forEach((item) => {
        const active = item.id === `page-${page}`;
        item.classList.toggle('is-active', active);
        item.hidden = !active;
      });
      if (page === 'trainer') setTimeout(() => { resizeThree(); fitCamera(); }, 0);
      updateMobileNavigation(page);
      setTimeout(applyTrainingLayout, 0);
    }));

    const saved = JSON.parse(localStorage.getItem(profileKey('pipe-route-progress')) || '[]');
    document.querySelectorAll('[data-task]').forEach((checkbox) => {
      checkbox.checked = saved.includes(checkbox.dataset.task);
      checkbox.addEventListener('change', saveRouteProgress);
    });
    saveRouteProgress(false);

    // 键盘快捷键
    document.addEventListener('keydown', (event) => {
      // 如果焦点在输入框中，不触发快捷键
      if (event.target.matches('input, select, textarea, [contenteditable]')) return;
      // 如果快速计算器打开，不触发训练器快捷键
      if (!getCachedElement('quickCalcDrawer').hidden) return;

      const shortcuts = {
        'n': () => getCachedElement('addSegmentBtn').click(),
        'r': () => getCachedElement('randomBtn').click(),
        'f': () => fitCamera(),
        'ArrowLeft': () => selectSegment((selectedSegment - 1 + state.segments.length) % state.segments.length),
        'ArrowRight': () => selectSegment((selectedSegment + 1) % state.segments.length),
        'Escape': () => {
          if (quizActive) {
            quizActive = false;
            updateVisualsOnly();
          }
        }
      };

      if (shortcuts[event.key]) {
        event.preventDefault();
        shortcuts[event.key]();
      }
    });
  }

  function saveRouteProgress(persist = true) {
    const checked = Array.from(document.querySelectorAll('[data-task]:checked')).map((input) => input.dataset.task);
    if (persist) writeJson(profileKey('pipe-route-progress'), checked);
    document.getElementById('routeProgressText').textContent = `${checked.length} / 16`;
    document.getElementById('routeProgressBar').style.width = `${checked.length / 16 * 100}%`;
    renderProfilePage();
  }

  initProfileCore();
  initThree();
  bindEvents();
  initCaseLibrary();
  initCollapsiblePanels();
  initLandscapeControls();
  initThemeToggle();
  initTrainingModules();
  initCalculators();
  initQuickCalculator();
  initMobileNavigation();
  initProfileUI();
  syncHeaderInputs();
  updateAll(true);
})();
