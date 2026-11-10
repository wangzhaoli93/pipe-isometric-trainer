(function () {
  'use strict';

  const categoryNames = {
    fitting: '管子与管件', flange: '法兰与密封面', gasket: '垫片与紧固件', valve: '阀门',
    equipment: '管道附件', insulation: '隔热与伴热', material: '材料与规格', layout: '布置与尺寸',
    drawing: '图纸与文件', operation: '操作与参数', welding: '施工与焊接', testing: '检验与试验'
  };
  const groups = {
    fitting: [
      ['P', 'Pipe', '管子', 'P也可能表示压力或防烫隔热，须结合栏位。'],
      ['PIPE WELDED', 'Welded pipe', '有缝管 / 焊管'], ['SMLS', 'Seamless pipe', '无缝管'],
      ['NIP / NIPPLE', 'Pipe nipple', '短节 / 短管'], ['SNIP', 'Swaged nipple', '异径短节'],
      ['EL / ELBOW', 'Elbow', '弯头'], ['ELL / LR', 'Long radius elbow', '长半径弯头，通常R=1.5D'],
      ['ELS / SR', 'Short radius elbow', '短半径弯头，通常R=1.0D'], ['MEL', 'Mitre elbow', '斜接弯头 / 虾米腰弯头'],
      ['REL', 'Reducing elbow', '异径弯头'], ['T / TEE', 'Tee', '三通', 'T也可能表示温度，须结合栏位。'],
      ['LT', 'Lateral tee', '斜三通'], ['RT / REDU.TEE', 'Reducing tee', '异径三通'],
      ['R / REDUCER', 'Reducer', '异径管接头 / 大小头'], ['CR / CONC', 'Concentric reducer', '同心异径管'],
      ['ER / ECC', 'Eccentric reducer', '偏心异径管'], ['CPL', 'Coupling', '管箍 / 管接头'],
      ['FCPL', 'Full coupling', '双头管箍 / 全接头'], ['HCPL', 'Half coupling', '单头管箍 / 半接头'],
      ['RCPL', 'Reducing coupling', '异径管箍'], ['BU', 'Bushing', '内外螺纹接头'],
      ['UN', 'Union', '活接头'], ['HC', 'Hose coupler', '软管接头'], ['SE', 'Stub end', '翻边短节'],
      ['CP / CAP', 'Cap', '管帽 / 封头'], ['PL / PLUG', 'Plug', '管堵 / 丝堵', 'PL也可能表示板式平焊法兰。'],
      ['BLK', 'Blank', '盲板'], ['SB', 'Spectacle blind', '8字盲板', 'SB也可能表示螺柱。'],
      ['RP', 'Reinforcing pad', '补强板'], ['WELDOLET', 'Welding outlet', '对焊支管台'],
      ['SOCKOLET', 'Socket-welding outlet', '承插焊支管台'], ['THREDOLET', 'Threaded outlet', '螺纹支管台'],
      ['ELBOLET', 'Elbow outlet', '弯头支管台'], ['LATROLET', 'Lateral outlet', '斜接支管台'],
      ['TOE', 'Threaded one end', '单端螺纹'], ['POE', 'Plain one end', '单端平口'],
      ['TBE', 'Threaded both ends', '两端螺纹'], ['PBE', 'Plain both ends', '两端平口']
    ],
    flange: [
      ['FLG / FLANGE', 'Flange', '法兰'], ['WN / WNF', 'Weld neck flange', '带颈对焊法兰'],
      ['SO / SOF', 'Slip-on flange', '平焊法兰'], ['SWF', 'Socket-welding flange', '承插焊法兰'],
      ['TH / THD', 'Threaded flange', '螺纹法兰'], ['LJ', 'Lap joint flange', '松套法兰'],
      ['REDF', 'Reducing flange', '异径法兰'], ['BF / BL', 'Blind flange', '法兰盖 / 盲法兰'],
      ['FF', 'Flat face', '全平面密封面'], ['RF', 'Raised face', '突面密封面'],
      ['MFF / MFM', 'Male and female face', '凹凸密封面'], ['LF', 'Female face', '凹面'],
      ['LM', 'Male face', '凸面'], ['RJ / RTJ', 'Ring joint face', '环连接密封面'],
      ['TG', 'Tongue and groove face', '榫槽密封面'], ['TF', 'Tongue face', '榫面'],
      ['GF', 'Groove face', '槽面'], ['LOOSE', 'Loose flange', '松套法兰'],
      ['LAP JOINT STUB END', 'Lap joint stub end', '松套法兰配套翻边短节']
    ],
    gasket: [
      ['G', 'Gasket', '垫片'], ['NMG', 'Non-metallic gasket', '非金属垫片'],
      ['AG', 'Asbestos gasket', '石棉垫片', '历史术语；是否允许使用必须按现行法规和项目要求。'],
      ['RG', 'Rubber gasket', '橡胶垫片'], ['TEG', 'PTFE envelope gasket', '聚四氟乙烯包覆垫片'],
      ['SMG', 'Semi-metallic gasket', '半金属垫片'], ['MJG', 'Metal-jacketed gasket', '金属包覆垫片'],
      ['SWG', 'Spiral wound gasket', '缠绕垫片'], ['MG', 'Metallic gasket', '金属垫片'],
      ['FMG', 'Flat metallic gasket', '金属平垫片'], ['SMSG', 'Solid metal serrated gasket', '齿形金属垫片'],
      ['LER', 'Lens ring gasket', '透镜式金属环垫'], ['OCR', 'Octagonal ring gasket', '八角形金属环垫'],
      ['OVR', 'Oval ring gasket', '椭圆形金属环垫'], ['IR / OR', 'Inner ring / outer ring', '内定位环 / 外定位环'],
      ['B', 'Bolt', '螺栓'], ['SB', 'Stud bolt', '螺柱 / 双头螺栓', 'SB也可能表示8字盲板。'],
      ['NU', 'Nut', '螺母'], ['TB', 'Turnbuckle', '花篮螺母'], ['WSR', 'Washer', '垫圈'],
      ['SWSR', 'Spring washer', '弹簧垫圈']
    ],
    valve: [
      ['GV', 'Gate valve', '闸阀'], ['GLV', 'Globe valve', '截止阀'], ['CHV', 'Check valve', '止回阀'],
      ['BUV', 'Butterfly valve', '蝶阀'], ['BAV', 'Ball valve', '球阀'], ['PV', 'Plug valve', '旋塞阀'],
      ['CV', 'Control valve', '调节阀 / 控制阀'], ['SV', 'Safety valve', '安全阀'],
      ['RV', 'Relief / reducing valve', '泄压阀或减压阀', 'RV含义随项目缩写表变化。'],
      ['PRV / PSV', 'Pressure relief valve', '压力泄放阀 / 安全阀', 'PRV在部分项目也指减压阀。'],
      ['ST', 'Steam trap', '蒸汽疏水阀'], ['BV', 'Breather valve', '呼吸阀'],
      ['NV', 'Needle valve', '针形阀'], ['AV', 'Angle valve', '角阀'], ['DV', 'Diaphragm valve', '隔膜阀'],
      ['TWV', 'Three-way valve', '三通阀'], ['SGV', 'Slide gate valve', '插板阀'],
      ['XV', 'On-off valve', '开关阀', 'XV通常为位号功能代号，按P&ID图例确认。']
    ],
    equipment: [
      ['SPR', 'Separator', '气液分离器'], ['FA', 'Flame arrester', '阻火器'], ['SR', 'Strainer', '过滤器'],
      ['SRY', 'Y-type strainer', 'Y型过滤器'], ['SRT', 'T-type strainer', 'T型过滤器'],
      ['SRB', 'Bucket-type strainer', '桶式 / 篮式过滤器'], ['TSR', 'Temporary strainer', '临时过滤器'],
      ['SIL', 'Silencer', '消声器'], ['SG', 'Sight glass', '视镜'], ['SC', 'Sample cooler', '取样冷却器'],
      ['DF', 'Drain funnel', '排液漏斗'], ['LM', 'Line mixer', '管道混合器'],
      ['RO', 'Restriction orifice', '限流孔板'], ['MO', 'Mixing orifice', '混合孔板'],
      ['RD', 'Rupture disk', '爆破片 / 爆破膜'], ['EJ', 'Expansion joint', '补偿器 / 膨胀节'],
      ['HOSE', 'Hose', '软管'], ['FLOWMETER / FT', 'Flowmeter', '流量计'],
      ['INSTRUMENT WITH DIAL', 'Instrument with dial', '带表盘仪表'], ['RING SIPHON', 'Ring siphon', '虹吸管']
    ],
    insulation: [
      ['INS', 'Thermal insulation', '隔热 / 绝热'], ['H', 'Hot insulation', '保温'],
      ['C', 'Cold insulation', '保冷'], ['P', 'Personnel protection insulation', '防烫伤隔热', 'P也可能表示管子或压力。'],
      ['T&I', 'Tracing and insulation', '伴热及保温'], ['TRACING', 'Pipe tracing', '管道伴热'],
      ['EST', 'External steam tracing', '蒸汽外伴热'], ['IST', 'Internal steam tracing', '蒸汽内伴热'],
      ['SJT', 'Steam-jacket tracing', '蒸汽夹套伴热'], ['ET', 'Electric tracing', '电伴热'],
      ['-H', 'Hot insulation suffix', '保温管线后缀'], ['-C', 'Cold insulation suffix', '保冷管线后缀'],
      ['-P', 'Personnel protection suffix', '防烫管线后缀'], ['-N', 'No insulation suffix', '不需绝热管线后缀']
    ],
    material: [
      ['M', 'Metallic material', '金属材料'], ['CS', 'Carbon steel', '碳钢'], ['CAS', 'Cast steel', '铸钢'],
      ['FS', 'Forged steel', '锻钢'], ['AS', 'Alloy steel', '合金钢'], ['SS', 'Stainless steel', '不锈钢'],
      ['AUST SS', 'Austenitic stainless steel', '奥氏体不锈钢'], ['CI', 'Cast iron', '铸铁'],
      ['MI', 'Malleable iron', '可锻铸铁'], ['DI', 'Ductile iron', '球墨铸铁'],
      ['AL', 'Aluminium', '铝'], ['BRS', 'Brass', '黄铜'], ['BRZ', 'Bronze', '青铜'], ['CU', 'Copper', '紫铜'],
      ['LAS', 'Low alloy steel', '低合金钢'], ['FLAS', 'Forged low alloy steel', '低合金锻钢'],
      ['CLAS', 'Cast low alloy steel', '低合金铸钢'], ['THK', 'Thickness', '壁厚'],
      ['SCH', 'Schedule number', '管壁厚度系列'], ['STD', 'Standard weight', '标准壁厚系列', '在管系列语境中STD不是泛指“标准”。'],
      ['XS', 'Extra strong', '加强壁厚系列'], ['XXS', 'Double extra strong', '特强壁厚系列'],
      ['GALV', 'Galvanized', '镀锌'], ['ASTM', 'ASTM International standard', 'ASTM材料或产品标准']
    ],
    layout: [
      ['CN', 'Construction north', '建北'], ['E', 'East', '东'], ['W', 'West', '西'], ['S', 'South', '南'],
      ['N', 'North', '北'], ['H', 'Horizontal', '水平'], ['V', 'Vertical', '竖直 / 铅直'],
      ['GR / GRD', 'Ground', '地面 / 地坪'], ['UG', 'Underground', '地下'], ['BL', 'Battery limit', '装置边界'],
      ['ESEW', 'Emergency shower and eye washer', '事故淋浴洗眼器'], ['HS', 'Hose station', '软管站'],
      ['ML', 'Match line', '接续分界线', 'ML也可能表示手动控制。'], ['PS', 'Piping support', '管道支架'],
      ['PR', 'Pipe rack', '管桥 / 管廊'], ['STRU', 'Structure', '构架 / 构筑物'], ['BLDG', 'Building', '建筑物'],
      ['PD', 'Purge device', '清扫设施'], ['PT', 'Pit', '池 / 坑', 'PT也可能表示渗透检测或压力变送器。'],
      ['SHLT', 'Shelter', '棚'], ['COFF', 'Cofferdam', '围堰'], ['FL', 'Floor', '楼板'], ['PF', 'Platform', '平台'],
      ['EL', 'Elevation', '标高'], ['BOP', 'Bottom of pipe', '管底标高'], ['COP', 'Center of pipe', '管中心标高'],
      ['TOP', 'Top of pipe', '管顶标高'], ['FOB', 'Flat on bottom', '偏心异径管底平'], ['FOT', 'Flat on top', '偏心异径管顶平'],
      ['CL', 'Center line', '中心线', 'CL也可能表示净距或等级。'], ['TL', 'Tangent line', '切线'],
      ['SYM', 'Symmetrical', '对称'], ['BOS', 'Bottom of support', '支架底标高'], ['TOS', 'Top of support', '支架顶标高'],
      ['CL', 'Clearance', '净距 / 净空', 'CL也可能表示中心线或等级。'], ['CTC', 'Center to center', '中心至中心'],
      ['CTF', 'Center to face', '中心至面'], ['CTE', 'Center to end', '中心至端部'], ['ETE', 'End to end', '端到端'],
      ['FTF', 'Face to face', '面到面'], ['D', 'Diameter', '直径'], ['DN', 'Nominal diameter', '公称直径'],
      ['NPS', 'Nominal pipe size', '英制公称管径', '不是实际外径，也不是“直管螺纹”。'],
      ['ID', 'Inside diameter', '内径'], ['OD', 'Outside diameter', '外径'], ['DIM', 'Dimension', '尺寸'],
      ['MAX', 'Maximum', '最大'], ['MIN', 'Minimum', '最小'], ['AVG', 'Average', '平均'], ['APP', 'Approximate', '约 / 近似'],
      ['PT.EL', 'Point elevation', '点标高'], ['CONNECTION ORIENTATION', 'Connection orientation', '管口方位']
    ],
    drawing: [
      ['PFD', 'Process flow diagram', '工艺流程图'], ['P&ID / PID', 'Piping and instrumentation diagram', '管道及仪表流程图'],
      ['COD / CONT.ON', 'Continued on drawing', '接续到其他图纸或管线'], ['CONN TO', 'Connect to', '连接到设备口或其他管线'],
      ['DTL', 'Detail', '详图'], ['SPDWG / ISODWG', 'Spool / isometric drawing', '管段图 / 轴测图'],
      ['DWG NO.', 'Drawing number', '图号'], ['DWG.TO / DWGI', 'Drawing identification', '所在图号 / 关联图号'],
      ['LOM / BOM', 'List / bill of materials', '材料表'], ['MTO', 'Material take-off', '材料统计 / 汇料'],
      ['APPX', 'Appendix', '附录'], ['JOB NO.', 'Job number', '工号'],
      ['BEDD', 'Basic engineering design data', '基础工程设计数据'], ['DEDD', 'Detailed engineering design data', '详细工程设计数据'],
      ['REV. NO.', 'Revision number', '修改号 / 版本号'], ['REF DWG', 'Reference drawing', '参考图'],
      ['SC', 'Sample connection', '采样接口'], ['INSTRUMENT', 'Instrument', '仪表 / 设备']
    ],
    operation: [
      ['AUT', 'Automatic', '自动'], ['ML', 'Manual control', '手动控制', 'ML也可能表示接续分界线。'],
      ['CHOP', 'Chain operated', '链条操作'], ['CSC', 'Car seal closed', '铅封关'], ['CSO', 'Car seal open', '铅封开'],
      ['LC', 'Locked closed', '锁闭'], ['LO', 'Locked open', '锁开'], ['NC', 'Normally closed', '正常关'],
      ['NO', 'Normally open', '正常开'], ['ATM', 'Atmosphere', '大气压 / 排向大气'], ['PN', 'Nominal pressure', '公称压力'],
      ['A', 'Absolute pressure', '绝对压力后缀'], ['G', 'Gauge pressure', '表压后缀'],
      ['T', 'Temperature', '温度', 'T也可能表示三通。'], ['P', 'Pressure', '压力', 'P也可能表示管子或防烫隔热。'],
      ['SUC', 'Suction', '吸入口'], ['DIS / DISCH', 'Discharge', '排出口'], ['DR / DRAIN', 'Drain', '排液 / 导淋'],
      ['V / VT', 'Vent', '放空 / 放气'], ['HP', 'High point', '高点'], ['LP', 'Low point', '低点'],
      ['SO', 'Steam out', '蒸汽吹扫口', 'SO也常表示平焊法兰。'], ['RTG', 'Rating', '压力等级'],
      ['CL', 'Class', '等级', 'CL也可能表示中心线或净距。'], ['UTL', 'Utility', '公用系统'],
      ['UC', 'Utility connection', '公用工程接头'], ['QTY', 'Quantity', '数量'], ['WT', 'Weight', '重量'],
      ['MHR', 'Man-hour', '工时'], ['BC', 'Bolt circle', '螺栓分布圆'], ['CA', 'Corrosion allowance', '腐蚀裕量']
    ],
    welding: [
      ['W', 'Welding', '焊接'], ['AW', 'Arc welding', '电弧焊'], ['GSAW', 'Gas-shielded arc welding', '气体保护电弧焊'],
      ['EFW', 'Electrofusion welding', '电熔焊'], ['ERW', 'Electric resistance welding', '电阻焊'], ['GW', 'Gas welding', '气焊'],
      ['LW', 'Lap welding', '搭接焊'], ['BW', 'Butt welding', '对焊'], ['TW', 'Tack welding', '定位焊'],
      ['SW', 'Socket welding', '承插焊', 'SW也可能按项目图例表示预制焊口。'], ['CW', 'Continuous welding', '连续焊'],
      ['SEW', 'Seal welding', '密封焊'], ['SFG', 'Surfacing', '堆焊'], ['FW', 'Field welding', '现场焊接'],
      ['GTAW', 'Gas tungsten arc welding', '钨极气体保护焊 / 氩弧焊'], ['SMAW', 'Shielded metal arc welding', '焊条电弧焊'],
      ['GTAW+SMAW', 'GTAW plus SMAW', '氩弧打底加焊条电弧焊'], ['SAW', 'Submerged arc welding', '埋弧焊'],
      ['GMAW', 'Gas metal arc welding', '熔化极气体保护焊'], ['HT', 'Heat treatment', '热处理'],
      ['PH', 'Preheating', '预热'], ['SR', 'Stress relief', '应力消除'], ['PWHT', 'Post-weld heat treatment', '焊后热处理'],
      ['WW', 'Welding wire', '焊丝'], ['ASSY', 'Assembly', '装配 / 组合'], ['F', 'Field', '现场'],
      ['F/F', 'Field fabricated', '现场制造'], ['SF', 'Suit in field', '现场决定 / 现场配制'], ['CSP', 'Cold spring', '冷紧'],
      ['BCT', 'Bolt cold tightening', '螺栓冷紧'], ['BHY', 'Bolt hot tightening', '螺栓热紧'],
      ['CO', 'Clean out', '清洗口'], ['ANNY', 'Annealed', '退火'], ['PE', 'Plain end', '平端'],
      ['BE', 'Bevelled end', '坡口端'], ['THR', 'Threaded', '螺纹端']
    ],
    testing: [
      ['EIT', 'Examination, inspection and testing', '检查、检验与试验'], ['VE / VT', 'Visual examination / testing', '外观检查'],
      ['UT', 'Ultrasonic testing', '超声检测'], ['RT', 'Radiographic testing', '射线检测'],
      ['MT / MPI', 'Magnetic particle testing', '磁粉检测'], ['PT / LPI', 'Liquid penetrant testing', '液体渗透检测', 'PT在P&ID中也可能表示压力变送器。'],
      ['HADT', 'Hardness testing', '硬度试验', 'HADT为来源资料用法，项目常见代号可能不同。'],
      ['HYDT', 'Hydrostatic testing', '水压试验'], ['PNET', 'Pneumatic testing', '气压试验'],
      ['HB', 'Brinell hardness', '布氏硬度'], ['RC', 'Rockwell hardness', '洛氏硬度'],
      ['NDT / NDE', 'Non-destructive testing / examination', '无损检测 / 无损检验']
    ]
  };

  const items = [];
  Object.entries(groups).forEach(([category, rows]) => rows.forEach(([code, english, chinese, note = '']) => {
    items.push({ id: `${category}-${items.length + 1}`, category, categoryName: categoryNames[category], code, english, chinese, note, source: '用户提供资料，2026-11' });
  }));
  window.PipeTerminologyData = { categoryNames, items };
})();
