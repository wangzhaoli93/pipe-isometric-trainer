(function () {
  'use strict';

  const items = [
    { category: 'fitting', code: 'TEE', name: '等径三通', visual: 'tee-equal', description: '主管与支管公称尺寸相同，用于分流或汇流。支口朝向由安装坐标决定，不是另一种管件型号。', identify: '三个接口公称尺寸相同；材料表常只列一个尺寸。', standard: 'GB/T 12459-2025；ASME B16.9-2024', note: '图上先判断主管方向，再从三通中心判断支口的E、N、EL变化。', tags: ['三通', '等径', 'BW', '分支'] },
    { category: 'fitting', code: 'RED TEE', name: '异径三通', visual: 'tee-reducing', description: '支管公称尺寸小于主管，兼有分流和变径作用。', identify: '材料表通常按主管×支管标注，例如DN100×DN50或NPS 4×2。', standard: 'GB/T 12459-2025；ASME B16.9-2024', note: '不要仅凭轴测线粗细判断异径，必须读取尺寸标注或材料表。', tags: ['三通', '异径', 'Reducing Tee'] },
    { category: 'fitting', code: 'LR ELBOW', name: '长半径弯头', visual: 'elbow-lr', description: '用于改变管道方向，常见转角有90°和45°。LR表示长半径。', identify: '弯曲较平缓，图纸或材料表常出现LR。', standard: 'GB/T 12459-2025；ASME B16.9-2024', note: '中心至端面尺寸必须查对应标准、尺寸和壁厚系列，不能只用示意图估算。', tags: ['弯头', 'LR', '90度', '45度'] },
    { category: 'fitting', code: 'SR ELBOW', name: '短半径弯头', visual: 'elbow-sr', description: '在空间受限处改变方向，SR表示短半径。', identify: '外形比LR紧凑；材料表必须明确SR。', standard: 'GB/T 12459-2025；ASME B16.9-2024', note: '能否采用SR由设计、压降、冲蚀和项目规范决定。', tags: ['弯头', 'SR', '短半径'] },
    { category: 'fitting', code: 'CON RED', name: '同心异径管', visual: 'reducer-con', description: '大小端中心线重合，用于同轴变径。', identify: '剖面上下同时收缩，中心线保持不变。', standard: 'GB/T 12459-2025；ASME B16.9-2024', note: '立管常见，但实际采用仍以设计为准。', tags: ['大小头', '同心', 'Concentric Reducer'] },
    { category: 'fitting', code: 'ECC RED', name: '偏心异径管', visual: 'reducer-ecc', description: '一侧保持平直，另一侧变径，用于控制积液或积气。', identify: '剖面只有一侧明显收缩；图纸还应注明平边朝向。', standard: 'GB/T 12459-2025；ASME B16.9-2024', note: '平顶、平底的缩写可能随项目规定变化，应结合图例、BOP/TOP和介质要求。', tags: ['大小头', '偏心', 'Eccentric Reducer', '平顶', '平底'] },
    { category: 'fitting', code: 'CAP', name: '管帽', visual: 'cap', description: '焊接在管端，用于永久封闭管道端部。', identify: '只有一个连接端，另一端为封闭曲面。', standard: 'GB/T 12459-2025；ASME B16.9-2024', note: '与临时盲板、八字盲板和法兰盖不是同一种部件。', tags: ['管帽', '封头', 'Cap'] },

    { category: 'flange', code: 'WN', name: '带颈对焊法兰', visual: 'wn', description: '法兰颈部与管子对焊，锥颈过渡明显，承压管道中常见。', identify: '有较长锥形颈，管端与法兰颈形成一道对接焊口。', standard: 'GB/T 9124.1/2；ASME B16.5', note: '识别时看长锥颈，不要只看法兰盘厚度。', tags: ['Welding Neck', '对焊颈', '法兰'] },
    { category: 'flange', code: 'SO', name: '带颈平焊法兰', visual: 'so', description: '管子插入法兰孔内，通过角焊缝连接。', identify: '颈部较短，管子穿入法兰；通常可见内外角焊位置。', standard: 'GB/T 9124.1/2；ASME B16.5', note: '插入深度、焊缝形式及适用工况按项目标准和工艺执行。', tags: ['Slip-On', '平焊', '法兰'] },
    { category: 'flange', code: 'PL', name: '板式平焊法兰', visual: 'pl', description: '板状法兰套在管子外，通过角焊缝连接，常见于PN系列项目。', identify: '基本没有锥颈，主体像一块平板圆环。', standard: 'GB/T 9124.1-2019（PN系列）', note: '不要把PL与短颈SO混为一类；按材料表代号和结构确认。', tags: ['Plate Flange', '板式', '平焊'] },
    { category: 'flange', code: 'SW', name: '承插焊法兰', visual: 'sw', description: '管子插入内部承口，通过外侧角焊缝连接，常用于较小口径。', identify: '孔内有承口台阶，管端与承口底部之间需按工艺留间隙。', standard: 'GB/T 9124.1/2；ASME B16.5', note: '不能套用对接焊根部间隙公式。', tags: ['Socket Weld', '承插', '法兰'] },
    { category: 'flange', code: 'TH / THD', name: '螺纹法兰', visual: 'threaded', description: '法兰孔带管螺纹，与外螺纹管端连接。部分培训资料写PT，但该缩写并非所有项目通用。', identify: '剖面孔内有螺纹线，没有对焊坡口。', standard: 'GB/T 9124.1/2；ASME B16.5', note: 'PT在仪表图中还可能表示压力变送器；螺纹代号、密封方式和适用工况必须结合图例与规格书。', tags: ['Threaded', 'PT', '螺纹', '法兰'] },
    { category: 'flange', code: 'LJ', name: '松套法兰', visual: 'lj', description: '由可转动的松套法兰与翻边短节或焊环配合使用。', identify: '法兰本体不直接焊在主管上，可绕短节转动便于对孔。', standard: 'GB/T 9124.1；ASME B16.5', note: '必须把松套环和配套短节作为组合识别。', tags: ['Lap Joint', '松套', 'Stub End'] },
    { category: 'flange', code: 'BL', name: '法兰盖 / 盲板法兰', visual: 'blind', description: '无通孔，用于封闭法兰端口。', identify: '中心为实心板，没有管道贯穿孔。', standard: 'GB/T 9124.1/2；ASME B16.5', note: '与可抽取的八字盲板、插板和管帽用途及结构不同。', tags: ['Blind Flange', '盲板', '法兰盖'] },
    { category: 'flange', code: 'IF', name: '整体法兰', visual: 'integral', description: '法兰与设备接管、阀体或管件本体形成整体结构。', identify: '法兰颈与主体连续，不存在独立法兰与管子的连接焊口。', standard: '按设备、阀门或项目采用的产品标准', note: '仅凭轴测符号通常不能确认制造结构，应查设备图和材料表。', tags: ['Integral Flange', '整体法兰', '设备口'] },

    { category: 'facing', code: 'FF', name: '全平面', visual: 'ff', description: '法兰整个接触面基本位于同一平面。', identify: '密封面没有局部凸台。', standard: '按对应PN或Class法兰标准', note: '垫片通常覆盖范围与RF不同，不能只按螺栓孔数判断。', tags: ['Flat Face', '全平面', '密封面'] },
    { category: 'facing', code: 'RF', name: '突面', visual: 'rf', description: '法兰内侧密封区域高出外围形成凸台。', identify: '剖面能看到中心环形凸起。', standard: 'GB/T 9124系列；ASME B16.5', note: 'RF高度、表面粗糙度和垫片按等级与标准核对。', tags: ['Raised Face', '突面', '密封面'] },
    { category: 'facing', code: 'RTJ', name: '环连接面', visual: 'rtj', description: '密封面加工环形槽，与金属环垫配合。', identify: '剖面上有明显环槽，标记常见RTJ。', standard: 'GB/T 9124.2；ASME B16.5', note: '环号、槽尺寸、材料和硬度必须成套匹配。', tags: ['Ring Type Joint', '环槽', '金属环垫'] },
    { category: 'facing', code: 'MFM', name: '凹凸面', visual: 'mfm', description: '一片法兰为凸面，另一片为配合凹面。', identify: '必须成对出现，一凸一凹。', standard: '按对应法兰标准和项目规定', note: '不能拿两个凸面或两个凹面直接配对。', tags: ['Male Female', '凹凸面', '密封面'] },
    { category: 'facing', code: 'TG', name: '榫槽面', visual: 'tg', description: '一片带窄榫，另一片带对应槽，限制垫片位置。', identify: '剖面为窄舌和窄槽成对配合。', standard: '按对应法兰标准和项目规定', note: '方向、配对和垫片尺寸必须一致。', tags: ['Tongue Groove', '榫槽', '密封面'] },

    { category: 'material', code: '20', name: '20钢无缝管常见标记', visual: 'pipe-carbon', description: '国内工业管道常见碳钢管材料牌号之一，常与相应钢管产品标准一起标注。', identify: '材料栏可能同时出现20和GB/T 8163等产品标准。', standard: '材料牌号与产品标准应同时核对', note: '不能仅凭“碳钢”二字替代具体牌号、交货状态和检验要求。', tags: ['碳钢', '20钢', '无缝管', 'GB/T 8163'] },
    { category: 'material', code: 'A106 Gr.B', name: '美标碳钢无缝管', visual: 'pipe-carbon', description: 'ASME体系项目中常见的高温用无缝碳钢管材料标记。', identify: '材料表常写ASTM A106 Gr.B，并另列ASME B36.10M尺寸系列。', standard: 'ASTM A106/A106M；尺寸另查项目采用标准', note: 'A106 Gr.B与国内20钢不是自动等同替换关系。', tags: ['ASTM', '碳钢', 'Pipe', 'Gr.B'] },
    { category: 'material', code: 'A234 WPB', name: '美标碳钢对焊管件材料', visual: 'fitting-carbon', description: '常用于碳钢对焊弯头、三通、异径管和管帽。', identify: '管件本体标记常见WPB，尺寸型式通常结合ASME B16.9。', standard: 'ASTM A234/A234M；ASME B16.9', note: '材料标准与尺寸标准是两件事，需要同时确认。', tags: ['WPB', '碳钢管件', '弯头', '三通'] },
    { category: 'material', code: 'A105', name: '美标碳钢锻件材料', visual: 'flange-carbon', description: '常见于锻制碳钢法兰和锻制管件。', identify: '法兰或锻件本体打标常见A105，并伴随Class、尺寸和炉批号。', standard: 'ASTM A105/A105M', note: 'A105是材料牌号，不是法兰结构代号。', tags: ['锻件', '碳钢法兰', 'Forging'] },
    { category: 'material', code: '06Cr19Ni10', name: '国内奥氏体不锈钢常见牌号', visual: 'pipe-stainless', description: '常见的18-8型奥氏体不锈钢牌号，可能用于管材或其他制品。', identify: '应同时核对产品标准、状态和成分要求。', standard: '按项目指定的材料与产品标准', note: '通常对应304系列概念，但不能据此直接代替ASTM材料。', tags: ['不锈钢', '304', '管材'] },
    { category: 'material', code: '022Cr17Ni12Mo2', name: '国内低碳含钼不锈钢常见牌号', visual: 'pipe-stainless', description: '低碳、含钼奥氏体不锈钢常见牌号。', identify: '材料栏应完整读取数字和Cr、Ni、Mo字符。', standard: '按项目指定的材料与产品标准', note: '通常对应316L系列概念，但不能跳过材料代用审批。', tags: ['不锈钢', '316L', '含钼'] },
    { category: 'material', code: 'A312 TP304/316L', name: '美标不锈钢管常见标记', visual: 'pipe-stainless', description: 'ASME体系项目中常见奥氏体不锈钢管材料标记。', identify: 'TP表示管材牌号标记的一部分，后接304、304L、316L等。', standard: 'ASTM A312/A312M', note: '必须区分304、304L、316和316L，不能只写“不锈钢”。', tags: ['TP304', 'TP316L', 'Stainless Pipe'] },
    { category: 'material', code: 'A403 / A182', name: '不锈钢管件与法兰常见材料', visual: 'stainless-set', description: 'A403常见于不锈钢对焊管件；A182的F304/F316L等常见于锻制法兰和锻件。', identify: 'WP前缀多见于对焊管件，F前缀多见于锻件。', standard: 'ASTM A403/A403M；ASTM A182/A182M', note: '同属不锈钢也要区分管、管件、锻件各自材料标准。', tags: ['WP304', 'WP316L', 'F304', 'F316L'] },

    { category: 'standard', code: 'GB/T 6567.5-2008', name: '管路轴测图图形符号画法', visual: 'standard-drawing', description: '规定管路、管件和阀门等图形符号的轴测表达。', identify: '用于理解图纸符号与轴测表示，不是管件尺寸标准。', standard: '现行国家推荐性标准', note: '项目图纸仍应优先读取本项目图例和说明。', tags: ['轴测图', '图形符号', '国标'] },
    { category: 'standard', code: 'GB/T 12459-2025', name: '钢制对焊管件 类型与参数', visual: 'standard-fitting', description: '覆盖弯头、三通、四通、异径管、管帽和翻边短节等钢制对焊管件。', identify: '采用DN体系，查类型、尺寸和公差。', standard: '2026-05-01实施，替代2017版', note: '材料和使用条件还需结合其他标准及项目规格书。', tags: ['国标', '对焊管件', '三通', '弯头'] },
    { category: 'standard', code: 'GB/T 9124.1-2019', name: '钢制管法兰 PN系列', visual: 'standard-flange', description: 'PN标识钢制管法兰的类型、参数和相关要求。', identify: '重点看PN、公称尺寸、法兰类型和密封面。', standard: '现行标准，修订项目进行中', note: '不要继续引用已废止的GB/T 9112-2010作为现行总标准。', tags: ['PN', '国标法兰', '钢制法兰'] },
    { category: 'standard', code: 'GB/T 9124.2-2019', name: '钢制管法兰 Class系列', visual: 'standard-flange', description: 'Class标识钢制管法兰和法兰盖的类型、尺寸与技术要求。', identify: '重点看Class、NPS、法兰类型和密封面。', standard: '现行标准，修订项目进行中', note: '虽然使用Class体系，也要按项目指定版本执行。', tags: ['Class', '国标法兰', 'NPS'] },
    { category: 'standard', code: 'ASME B16.9-2024', name: '美标工厂制造对焊管件', visual: 'standard-fitting', description: '覆盖工厂制造锻制对焊管件的尺寸、公差、额定值、试验和标记等。', identify: '常见NPS、Schedule及材料标准组合。', standard: 'ASME现行版本', note: '尺寸标准不能替代材料标准。', tags: ['ASME', 'B16.9', 'Buttwelding Fittings'] },
    { category: 'standard', code: 'ASME B16.5-2025', name: 'NPS 1/2～24管法兰与法兰管件', visual: 'standard-flange', description: '覆盖NPS 1/2至24的法兰及法兰管件，包括压力温度等级、尺寸、公差和标记等。', identify: '常见Class 150、300、400、600、900、1500及部分Class 2500。', standard: 'ASME现行版本', note: '大口径NPS 26～60通常转查ASME B16.47。', tags: ['ASME', 'B16.5', 'Flange', 'Class'] },
    { category: 'standard', code: 'ASME B16.11-2021', name: '承插焊和螺纹锻制管件', visual: 'standard-forged', description: '覆盖承插焊和螺纹锻制管件的等级、尺寸、公差、标记与材料要求。', identify: '常见于小口径SW或THD锻制管件。', standard: 'ASME现行版本', note: '其Class标识不能与B16.5法兰Class简单等同理解。', tags: ['ASME', 'B16.11', 'SW', 'THD'] },
    { category: 'standard', code: 'ASME B16.47-2025', name: 'NPS 26～60大直径钢制法兰', visual: 'standard-flange', description: '覆盖NPS 26至60大直径钢制法兰。', identify: '大口径时先确认采用Series A还是Series B及项目指定版本。', standard: 'ASME现行版本', note: '不能直接套用B16.5的小口径尺寸表。', tags: ['ASME', '大口径法兰', 'Series A', 'Series B'] }
  ];

  const categoryNames = { fitting: '管件', flange: '法兰', facing: '密封面', material: '材料', standard: '标准' };
  const symbolBasics = [
    { id: 'pipe-up', name: '管口向上', kind: 'pipe', direction: 'up', detail: '开口朝EL+；常见画法会用圆口及填充方向提示。' },
    { id: 'pipe-down', name: '管口向下', kind: 'pipe', direction: 'down', detail: '开口朝EL-；必须结合本项目图例辨认圆口填充。' },
    { id: 'elbow-up', name: '弯头转向上', kind: 'elbow', direction: 'up', detail: '水平管到弯头后转为EL+立管。' },
    { id: 'elbow-down', name: '弯头转向下', kind: 'elbow', direction: 'down', detail: '水平管到弯头后转为EL-立管。' },
    { id: 'tee-up', name: '三通支口向上', kind: 'tee', direction: 'up', detail: '主管保持原方向，支口从中心朝EL+。' },
    { id: 'tee-down', name: '三通支口向下', kind: 'tee', direction: 'down', detail: '主管保持原方向，支口从中心朝EL-。' },
    { id: 'tee-north', name: '三通支口向北', kind: 'tee', direction: 'north', detail: '主管W↔E，支口朝N+；等轴图中通常画向左下。' },
    { id: 'tee-south', name: '三通支口向南', kind: 'tee', direction: 'south', detail: '主管W↔E，支口朝N-；等轴图中通常画向右上。' }
  ];
  let activeCategory = 'basics';
  let teeDirection = 'up';
  let teeType = 'equal';
  let teeStandard = 'gb';

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function svg(content, label) {
    return `<svg viewBox="0 0 260 130" role="img" aria-label="${escapeHtml(label)}"><title>${escapeHtml(label)}</title>${content}</svg>`;
  }

  function fittingSvg(type, label) {
    if (type.startsWith('tee')) {
      const branchWidth = type === 'tee-reducing' ? 12 : 20;
      return svg(`<path class="ref-pipe" d="M20 74 H240 V94 H20 Z"/><path class="ref-pipe" d="M120 74 V20 H${120 + branchWidth} V74 Z"/><circle class="ref-detail" cx="130" cy="84" r="7"/>`, label);
    }
    if (type.startsWith('elbow')) {
      const radius = type === 'elbow-sr' ? 38 : 62;
      return svg(`<path class="ref-pipe" d="M25 100 H85 A${radius} ${radius} 0 0 1 ${85 + radius} ${100 - radius} V18 H${85 + radius + 20} V${100 - radius} A${radius + 20} ${radius + 20} 0 0 0 85 120 H25 Z"/>`, label);
    }
    if (type === 'reducer-con') return svg('<path class="ref-pipe" d="M20 45 H90 L180 58 H240 V78 H180 L90 91 H20 Z"/><line class="ref-detail" x1="15" y1="68" x2="245" y2="68"/>', label);
    if (type === 'reducer-ecc') return svg('<path class="ref-pipe" d="M20 44 H90 L180 58 H240 V78 H180 L90 78 H20 Z"/><line class="ref-detail" x1="15" y1="78" x2="245" y2="78"/>', label);
    return svg('<rect class="ref-pipe" x="20" y="55" width="145" height="25"/><path class="ref-metal" d="M165 40 Q235 48 235 67.5 Q235 87 165 95 Z"/>', label);
  }

  function flangeSvg(type, label) {
    const pipe = '<rect class="ref-pipe" x="15" y="55" width="225" height="22"/>';
    const plate = '<rect class="ref-metal" x="125" y="18" width="22" height="96"/>';
    if (type === 'wn') return svg(`${pipe}<path class="ref-metal" d="M65 51 L112 38 L125 18 H147 V114 H125 L112 94 L65 81 Z"/><rect class="ref-detail" x="147" y="47" width="7" height="38"/>`, label);
    if (type === 'so') return svg(`${pipe}${plate}<path class="ref-metal" d="M85 48 H125 V84 H85 L70 77 V55 Z"/><path class="ref-detail" d="M112 52 l10 -10 M112 80 l10 10"/>`, label);
    if (type === 'pl') return svg(`${pipe}${plate}<path class="ref-detail" d="M120 52 l8 -9 M120 80 l8 9"/>`, label);
    if (type === 'sw') return svg(`<rect class="ref-pipe" x="15" y="55" width="105" height="22"/>${plate}<path class="ref-metal" d="M75 45 H125 V87 H75 Z"/><path class="ref-detail" d="M118 55 V77 M118 55 H105 M118 77 H105"/>`, label);
    if (type === 'threaded') return svg(`${pipe}${plate}<path class="ref-metal" d="M78 45 H125 V87 H78 Z"/><path class="ref-thread" d="M82 56 l35 18 M82 62 l30 16 M88 52 l30 16"/>`, label);
    if (type === 'lj') return svg(`${pipe}<rect class="ref-metal" x="112" y="20" width="24" height="92"/><path class="ref-detail" d="M98 52 H146 V80 H98 L88 72 V60 Z"/><line class="ref-detail" x1="136" y1="45" x2="148" y2="45"/><line class="ref-detail" x1="136" y1="87" x2="148" y2="87"/>`, label);
    if (type === 'blind') return svg('<rect class="ref-metal" x="112" y="18" width="28" height="96"/><line class="ref-detail" x1="140" y1="45" x2="148" y2="45"/><line class="ref-detail" x1="140" y1="87" x2="148" y2="87"/>', label);
    return svg(`${pipe}<path class="ref-metal" d="M25 25 H145 V15 H170 V117 H145 V107 H25 Z"/><rect class="ref-detail" x="170" y="48" width="7" height="36"/>`, label);
  }

  function flangeExteriorSvg(type, label) {
    const holes = [[72, 48], [105, 36], [145, 36], [178, 48], [72, 82], [105, 94], [145, 94], [178, 82]].map(([x, y]) => `<circle class="ref-detail" cx="${x}" cy="${y}" r="4"/>`).join('');
    const base = `<ellipse class="ref-metal" cx="125" cy="68" rx="72" ry="38"/>${holes}`;
    if (type === 'blind') return svg(`${base}<ellipse class="ref-detail" cx="125" cy="68" rx="23" ry="12"/>`, `${label}外形`);
    if (type === 'pl') return svg(`${base}<ellipse class="ref-pipe" cx="125" cy="68" rx="28" ry="15"/>`, `${label}外形`);
    if (type === 'lj') return svg(`${base}<ellipse class="ref-pipe" cx="125" cy="68" rx="30" ry="16"/><path class="ref-detail" d="M190 32 h36 v72 h-36 M199 49 h27 M199 87 h27"/>`, `${label}外形`);
    const hubHeight = type === 'wn' ? 22 : 40;
    const hubWidth = type === 'wn' ? 33 : 27;
    const hub = `<path class="ref-pipe" d="M${125 - hubWidth} 68 L${108} ${hubHeight} Q125 ${hubHeight - 9} 142 ${hubHeight} L${125 + hubWidth} 68 Z"/><ellipse class="ref-metal" cx="125" cy="${hubHeight}" rx="17" ry="9"/>`;
    const detail = type === 'threaded' ? '<path class="ref-thread" d="M111 20 l28 9 M111 25 l25 8 M114 16 l25 8"/>' : type === 'sw' ? '<ellipse class="ref-detail" cx="125" cy="34" rx="22" ry="12"/>' : '';
    if (type === 'integral') return svg(`${base}<path class="ref-pipe" d="M28 40 H125 V15 H165 V120 H125 V96 H28 Z"/>`, `${label}外形`);
    return svg(`${base}${hub}${detail}`, `${label}外形`);
  }

  function facingSvg(type, label) {
    const left = '<rect class="ref-metal" x="55" y="20" width="28" height="90"/>';
    const right = '<rect class="ref-metal" x="177" y="20" width="28" height="90"/>';
    if (type === 'ff') return svg(`${left}${right}<line class="ref-detail" x1="83" y1="25" x2="83" y2="105"/><line class="ref-detail" x1="177" y1="25" x2="177" y2="105"/>`, label);
    if (type === 'rf') return svg(`${left}${right}<rect class="ref-detail" x="83" y="43" width="12" height="44"/><rect class="ref-detail" x="165" y="43" width="12" height="44"/>`, label);
    if (type === 'rtj') return svg(`${left}${right}<path class="ref-detail" d="M83 45 l12 8 -12 8 M177 45 l-12 8 12 8"/><path class="ref-detail" d="M83 70 l12 8 -12 8 M177 70 l-12 8 12 8"/>`, label);
    if (type === 'mfm') return svg(`${left}${right}<path class="ref-detail" d="M83 42 H98 V88 H83 M177 42 H164 V88 H177"/>`, label);
    return svg(`${left}${right}<path class="ref-detail" d="M83 47 H103 V82 H83 M177 47 H158 V82 H177"/>`, label);
  }

  function materialSvg(type, label) {
    const stainless = type.includes('stainless');
    const component = type.startsWith('flange') ? 'FLANGE' : type.startsWith('fitting') ? 'FITTING' : type === 'stainless-set' ? 'PIPE · FITTING · FLANGE' : 'PIPE';
    return svg(`<ellipse class="ref-metal" cx="130" cy="28" rx="72" ry="18"/><path class="ref-pipe" d="M58 28 V88 C58 99 90 108 130 108 C170 108 202 99 202 88 V28 C202 39 170 48 130 48 C90 48 58 39 58 28 Z"/><text x="130" y="72" text-anchor="middle">${component}</text><text x="130" y="90" text-anchor="middle">${stainless ? 'STAINLESS' : 'MATERIAL MARK'}</text>`, label);
  }

  function standardSvg(item) {
    return svg(`<path class="ref-metal" d="M52 15 H190 L215 40 V115 H52 Z"/><path class="ref-detail" d="M190 15 V40 H215"/><line class="ref-thread" x1="75" y1="55" x2="190" y2="55"/><line class="ref-thread" x1="75" y1="72" x2="190" y2="72"/><line class="ref-thread" x1="75" y1="89" x2="165" y2="89"/><text x="132" y="35" text-anchor="middle">${escapeHtml(item.code)}</text>`, item.name);
  }

  function referenceVisual(item) {
    if (item.category === 'fitting') return fittingSvg(item.visual, item.name);
    if (item.category === 'flange') return `<div class="reference-dual-visual"><div><span>实物外形</span>${flangeExteriorSvg(item.visual, item.name)}</div><div><span>连接剖面</span>${flangeSvg(item.visual, item.name)}</div></div>`;
    if (item.category === 'facing') return facingSvg(item.visual, item.name);
    if (item.category === 'material') return materialSvg(item.visual, item.name);
    return standardSvg(item);
  }

  function symbolBasicSvg(item) {
    const centerX = 72, centerY = 75;
    const directionPoints = { up: [220, 28, 'EL+'], down: [220, 132, 'EL-'], north: [170, 118, 'N+'], south: [270, 48, 'N-'] };
    const [branchX, branchY, directionLabel] = directionPoints[item.direction];
    let symbolShape = '';
    let physicalShape = '';
    if (item.kind === 'pipe') {
      const fillY = item.direction === 'up' ? 59 : 75;
      const arrowY = item.direction === 'up' ? 30 : 120;
      symbolShape = `<circle class="symbol-circle" cx="${centerX}" cy="${centerY}" r="18"/><path class="symbol-fill" d="M54 ${fillY} A18 18 0 0 ${item.direction === 'up' ? 1 : 0} 90 ${fillY} L90 75 L54 75 Z"/><line class="symbol-line" x1="${centerX}" y1="${centerY}" x2="${centerX}" y2="${arrowY}"/><text x="42" y="112">${directionLabel}</text>`;
      physicalShape = `<path class="physical-main" d="M220 100 V${item.direction === 'up' ? 38 : 132}"/><ellipse class="physical-joint" cx="220" cy="${item.direction === 'up' ? 38 : 132}" rx="15" ry="7"/><text x="238" y="${item.direction === 'up' ? 42 : 132}">${directionLabel}</text>`;
    } else if (item.kind === 'elbow') {
      symbolShape = `<line class="symbol-line" x1="20" y1="${centerY}" x2="${centerX}" y2="${centerY}"/><circle class="symbol-circle" cx="${centerX}" cy="${centerY}" r="17"/><line class="symbol-line" x1="${centerX}" y1="${centerY}" x2="${centerX}" y2="${item.direction === 'up' ? 32 : 118}"/><text x="93" y="80">${directionLabel}</text>`;
      physicalShape = `<path class="physical-main" d="M155 98 H220 V${item.direction === 'up' ? 35 : 132}"/><circle class="physical-joint" cx="220" cy="98" r="7"/><text x="235" y="${item.direction === 'up' ? 42 : 130}">${directionLabel}</text>`;
    } else {
      const symbolBranchY = item.direction === 'up' ? 28 : item.direction === 'down' ? 122 : item.direction === 'north' ? 112 : 38;
      const symbolBranchX = item.direction === 'north' ? 28 : item.direction === 'south' ? 116 : centerX;
      symbolShape = `<line class="symbol-line" x1="15" y1="${centerY}" x2="130" y2="${centerY}"/><circle class="symbol-circle" cx="${centerX}" cy="${centerY}" r="16"/><line class="symbol-line" x1="${centerX}" y1="${centerY}" x2="${symbolBranchX}" y2="${symbolBranchY}"/><text x="92" y="110">${directionLabel}</text>`;
      physicalShape = `<line class="physical-main" x1="150" y1="98" x2="286" y2="98"/><line class="physical-branch" x1="220" y1="98" x2="${branchX}" y2="${branchY}"/><circle class="physical-joint" cx="220" cy="98" r="7"/><text x="${branchX + 8}" y="${branchY - 5}">${directionLabel}</text>`;
    }
    return `<svg viewBox="0 0 300 150" role="img" aria-label="${escapeHtml(item.name)}符号与外形"><title>${escapeHtml(item.name)}</title><text x="18" y="17">图纸符号</text><text x="172" y="17">空间外形</text><line class="ref-thread" x1="145" y1="10" x2="145" y2="140"/>${symbolShape}${physicalShape}</svg>`;
  }

  function renderSymbolBasics() {
    document.getElementById('symbolBasicsGrid').innerHTML = symbolBasics.map((item) => `<article class="symbol-basic-item">${symbolBasicSvg(item)}<div class="symbol-basic-body"><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.detail)}</p></div></article>`).join('');
  }

  function renderCards() {
    const query = document.getElementById('referenceSearch').value.trim().toLowerCase();
    const basicsOnly = activeCategory === 'basics' && !query;
    const filtered = items.filter((item) => {
      if (basicsOnly) return false;
      if (!query && activeCategory !== 'all' && item.category !== activeCategory) return false;
      const haystack = [item.code, item.name, item.description, item.identify, item.standard, item.note, ...item.tags].join(' ').toLowerCase();
      return !query || haystack.includes(query);
    });
    document.getElementById('referenceResultCount').textContent = `${filtered.length}项`;
    document.getElementById('referenceResultHeading').hidden = basicsOnly;
    document.getElementById('referenceCardGrid').hidden = basicsOnly;
    document.getElementById('referenceEmpty').hidden = basicsOnly || filtered.length > 0;
    document.getElementById('referenceCardGrid').innerHTML = filtered.map((item) => `<article class="reference-card">
      <div class="reference-card-visual">${referenceVisual(item)}</div>
      <div class="reference-card-body">
        <div class="reference-card-title"><h5>${escapeHtml(item.name)}</h5><code>${escapeHtml(item.code)}</code></div>
        <p>${escapeHtml(item.description)}</p>
        <dl class="reference-card-facts"><div><dt>识别要点</dt><dd>${escapeHtml(item.identify)}</dd></div><div><dt>标准参考</dt><dd>${escapeHtml(item.standard)}</dd></div></dl>
        <p class="reference-card-note">${escapeHtml(item.note)}</p>
        <div class="reference-tag-row"><span>${categoryNames[item.category]}</span>${item.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    </article>`).join('');
    updateReferenceSections(query);
  }

  function updateReferenceSections(query = document.getElementById('referenceSearch').value.trim()) {
    const searching = Boolean(query);
    const showBasics = !searching && activeCategory === 'basics';
    document.getElementById('drawingSymbolBasics').hidden = !showBasics;
    document.getElementById('teeOrientationTool').hidden = !showBasics;
    document.getElementById('elevationSizeGrid').hidden = !showBasics;
  }

  function renderTee() {
    const branchPoints = {
      up: { x: 310, y: 60, label: 'EL+', readout: '主管W↔E，支口EL+' },
      down: { x: 310, y: 340, label: 'EL-', readout: '主管W↔E，支口EL-' },
      north: { x: 185, y: 270, label: 'N+', readout: '主管W↔E，支口N+' },
      south: { x: 435, y: 125, label: 'N-', readout: '主管W↔E，支口N-' }
    };
    const branch = branchPoints[teeDirection];
    const branchWidth = teeType === 'equal' ? 13 : 8;
    const typeName = teeType === 'equal' ? '等径三通' : '异径三通';
    const standardName = teeStandard === 'gb' ? 'GB/T 12459-2025 · DN系列' : 'ASME B16.9-2024 · NPS系列';
    document.getElementById('teeDirectionReadout').textContent = branch.readout;
    document.getElementById('teeTypeReadout').textContent = typeName;
    document.getElementById('teeStandardReadout').textContent = standardName;
    document.getElementById('teeOrientationSvg').innerHTML = `<title>${typeName}${branch.label}支口示意</title><desc>主管沿西东方向，支口朝${branch.label}</desc>
      <line class="tee-guide" x1="75" y1="330" x2="545" y2="330"/>
      <line class="tee-main" x1="115" y1="90" x2="510" y2="318"/>
      <line class="tee-branch" x1="310" y1="202" x2="${branch.x}" y2="${branch.y}" style="stroke-width:${branchWidth}px"/>
      <circle class="tee-center" cx="310" cy="202" r="8"/>
      <circle class="tee-center" cx="${branch.x}" cy="${branch.y}" r="6"/>
      <text x="95" y="78">W / E-</text><text x="515" y="330">E / E+</text><text x="${branch.x + 10}" y="${branch.y - 10}">支口 ${branch.label}</text>
      <text class="tee-muted" x="235" y="30">${typeName} · ${standardName}</text>
      <line class="tee-axis tee-axis-e" x1="80" y1="315" x2="120" y2="338"/><text x="124" y="345">E+</text>
      <line class="tee-axis tee-axis-n" x1="80" y1="315" x2="40" y2="338"/><text x="14" y="345">N+</text>
      <line class="tee-axis tee-axis-z" x1="80" y1="315" x2="80" y2="260"/><text x="87" y="262">EL+</text>`;
  }

  function bindReferenceEvents() {
    document.getElementById('referenceSearch').addEventListener('input', renderCards);
    document.querySelectorAll('[data-reference-category]').forEach((button) => button.addEventListener('click', () => {
      activeCategory = button.dataset.referenceCategory;
      document.getElementById('referenceSearch').value = '';
      document.querySelectorAll('[data-reference-category]').forEach((item) => item.classList.toggle('is-active', item === button));
      renderCards();
    }));
    document.querySelectorAll('[data-tee-direction]').forEach((button) => button.addEventListener('click', () => {
      teeDirection = button.dataset.teeDirection;
      document.querySelectorAll('[data-tee-direction]').forEach((item) => item.classList.toggle('is-active', item === button));
      renderTee();
    }));
    document.querySelectorAll('[data-tee-type]').forEach((button) => button.addEventListener('click', () => {
      teeType = button.dataset.teeType;
      document.querySelectorAll('[data-tee-type]').forEach((item) => item.classList.toggle('is-active', item === button));
      renderTee();
    }));
    document.querySelectorAll('[data-tee-standard]').forEach((button) => button.addEventListener('click', () => {
      teeStandard = button.dataset.teeStandard;
      document.querySelectorAll('[data-tee-standard]').forEach((item) => item.classList.toggle('is-active', item === button));
      renderTee();
    }));
  }

  function showReferenceItem(code) {
    const item = items.find((entry) => entry.code === code) || items.find((entry) => entry.code.includes(code));
    if (!item) return false;
    activeCategory = item.category;
    document.querySelectorAll('[data-reference-category]').forEach((button) => button.classList.toggle('is-active', button.dataset.referenceCategory === activeCategory));
    document.getElementById('referenceSearch').value = item.code;
    renderCards();
    document.querySelector('[data-page="glossary"]')?.click();
    setTimeout(() => {
      const card = document.querySelector('.reference-card');
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card?.classList.add('global-search-target');
      setTimeout(() => card?.classList.remove('global-search-target'), 1700);
    }, 50);
    return true;
  }

  window.PipeReferenceLibrary = { items: items.map((item) => ({ ...item, tags: item.tags.slice() })), showItem: showReferenceItem };

  bindReferenceEvents();
  renderSymbolBasics();
  renderTee();
  renderCards();
})();
