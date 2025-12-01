// js/App.js

// 主应用组件 (依赖于 utils.js 和 constants.js 中定义的全局变量和函数)
const App = () => {
    const [taxTarget, setTaxTarget] = useState(SCENARIOS.custom.target);
    const [taxAmount, setTaxAmount] = useState(SCENARIOS.custom.taxAmount);
    const [Ed, setEd] = useState(SCENARIOS.custom.Ed);
    const [Es, setEs] = useState(SCENARIOS.custom.Es);
    const [scenario, setScenario] = useState('custom');

    const currentScenario = SCENARIOS[scenario];
    const { lockTarget, lockEd, lockEs } = currentScenario;
    const { width, height, P0, Q0 } = CHART_DIMENSIONS;

    // 使用 useMemo 进行核心经济学计算
    const { 
        Q_new, 
        P_consumer_pay, 
        P_producer_get, 
        consumerShare, 
        producerShare 
    } = useMemo(() => calculateEconomy(taxAmount, Ed, Es), [taxAmount, Ed, Es]);

    // 加载场景预设数据
    const loadScenario = (type) => {
        setScenario(type);
        const data = SCENARIOS[type];
        setTaxTarget(data.target);
        setEd(data.Ed);
        setEs(data.Es);
        setTaxAmount(data.taxAmount);
    };

    // --- 渲染界面 (JSX) ---
    return (
        <div className="min-h-screen flex flex-col items-center py-8 px-4">
            {/* 标题栏 */}
            <div className="w-full max-w-6xl mb-6 flex items-center justify-between border-b pb-4 border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">税负转嫁与归宿演示</h1>
                        <p className="text-slate-500 text-sm">直观展示税收、弹性与经济归宿的关系</p>
                    </div>
                </div>
                <div className="flex gap-2">
                     <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-600 text-sm font-medium flex items-center">
                        《财政学》第八章 税收
                     </div>
                </div>
            </div>
            
            {/* 场景选择模块 */}
            <div className="w-full max-w-6xl mb-8 bg-white p-5 rounded-xl shadow-lg border border-slate-100">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <RefreshCw size={18} />
                    快捷选择教学场景
                </h3>
                <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
                    
                    {scenarioKeys.map(key => {
                        const data = SCENARIOS[key];
                        const isCustom = key === 'custom';
                        return (
                            <button 
                                key={key}
                                onClick={() => loadScenario(key)}
                                className={`p-2 rounded-lg text-center transition-all border ${scenario === key 
                                    ? (isCustom ? 'bg-green-100 border-green-600 text-green-800 ring-1 ring-green-600' : 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500')
                                    : 'hover:bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                            >
                                <div className="font-bold text-base mb-1">{data.title}</div>
                                <div className={`text-sm font-medium ${isCustom ? 'text-slate-600' : (data.target === 'producer' ? 'text-amber-600' : 'text-purple-600')}`}>
                                    {data.targetLabel}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    {data.changeLabel}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>


            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 左侧：可视化图表 */}
                <div className="lg:col-span-8 bg-white rounded-xl shadow-lg border border-slate-100 p-6 relative overflow-hidden">
                    
                    {/* 图表标题 */}
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                            <BarChart3 size={18} />
                            市场均衡图示
                        </h2>
                        <p className="text-sm text-slate-400">
                            {taxTarget === 'consumer' ? '对消费者征税 (D曲线下移)' : '对生产者征税 (S曲线上移)'}
                        </p>
                    </div>

                    {/* 图例 */}
                    <div className="absolute top-6 right-6 bg-white/90 p-3 rounded-lg border shadow-sm text-xs space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-slate-400"></div>
                            <span>征税前曲线 (实线)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-slate-400 border-b border-dashed border-slate-600"></div>
                            <span>征税后曲线 (虚线)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-600/30 border border-purple-600"></div>
                            <span>消费者税负</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500/30 border border-amber-500"></div>
                            <span>生产者税负</span>
                        </div>
                    </div>

                    {/* SVG 画布 */}
                    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none">
                        {/* 网格背景 */}
                        <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* 坐标轴 */}
                        <line x1={xScale(0)} y1={yScale(0)} x2={xScale(100)} y2={yScale(0)} stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
                        <line x1={xScale(0)} y1={yScale(0)} x2={xScale(0)} y2={yScale(100)} stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
                        <text x={xScale(98)} y={yScale(-5)} textAnchor="end" className="axis-text font-bold">数量 (Q)</text>
                        <text x={xScale(2)} y={yScale(102)} textAnchor="start" className="axis-text font-bold">价格 (P)</text>

                        {/* 税负区域 (矩形) */}
                        <rect 
                            x={xScale(0)} y={yScale(P_consumer_pay)} width={xScale(Q_new) - xScale(0)} height={yScale(P0) - yScale(P_consumer_pay)}
                            fill="#9333ea" opacity="0.3" stroke="#9333ea" strokeWidth="1"
                        />
                        <rect 
                            x={xScale(0)} y={yScale(P0)} width={xScale(Q_new) - xScale(0)} height={yScale(P_producer_get) - yScale(P0)}
                            fill="#f59e0b" opacity="0.3" stroke="#f59e0b" strokeWidth="1"
                        />

                        {/* 曲线绘制 */}
                        <polyline points={generatePath(true, Ed, taxTarget, 0)} fill="none" stroke="#3b82f6" strokeWidth="2" />
                        <polyline points={generatePath(false, Es, taxTarget, 0)} fill="none" stroke="#f59e0b" strokeWidth="2" />
                        {taxTarget === 'consumer' && (<polyline points={generatePath(true, Ed, taxTarget, taxAmount)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />)}
                        {taxTarget === 'producer' && (<polyline points={generatePath(false, Es, taxTarget, taxAmount)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />)}

                        {/* 关键点标注 */}
                        
                        {/* 初始均衡点 E0 */}
                        <circle cx={xScale(Q0)} cy={yScale(P0)} r="4" fill="#94a3b8" />
                        <text x={xScale(Q0)+5} y={yScale(P0)-5} className="text-xs fill-slate-500 font-medium svg-symbol">E<tspan dy="0.3em" fontSize="70%">0</tspan></text>

                        {/* 价格点 P0, Pc, Pp 虚线 */}
                        <line x1={xScale(0)} y1={yScale(P0)} x2={xScale(Q0)} y2={yScale(P0)} stroke="#94a3b8" strokeDasharray="3,3" />
                        <text x={xScale(0)-5} y={yScale(P0)+4} textAnchor="end" className="text-xs font-bold fill-slate-700 svg-symbol">P<tspan dy="0.3em" fontSize="70%">0</tspan></text>
                        
                        {/* 价格点 Pc */}
                        <line x1={xScale(0)} y1={yScale(P_consumer_pay)} x2={xScale(Q_new)} y2={yScale(P_consumer_pay)} stroke="#9333ea" strokeDasharray="3,3" />
                        <circle cx={xScale(Q_new)} cy={yScale(P_consumer_pay)} r="3" fill="#9333ea" />
                        <text x={xScale(0)-5} y={yScale(P_consumer_pay)+4} textAnchor="end" className="text-xs font-bold fill-purple-600 svg-symbol">P<tspan dy="0.3em" fontSize="70%">c</tspan> (买方价格)</text>

                        {/* 价格点 Pp */}
                        <line x1={xScale(0)} y1={yScale(P_producer_get)} x2={xScale(Q_new)} y2={yScale(P_producer_get)} stroke="#d97706" strokeDasharray="3,3" />
                        <circle cx={xScale(Q_new)} cy={yScale(P_producer_get)} r="3" fill="#d97706" />
                        <text x={xScale(0)-5} y={yScale(P_producer_get)+4} textAnchor="end" className="text-xs font-bold fill-amber-600 svg-symbol">P<tspan dy="0.3em" fontSize="70%">p</tspan> (卖方价格)</text>
                        
                        {/* 新均衡点 E1 (数量 Q1) 虚线 */}
                        <line x1={xScale(Q_new)} y1={yScale(0)} x2={xScale(Q_new)} y2={yScale(P_consumer_pay)} stroke="#94a3b8" strokeDasharray="3,3" />
                        <text x={xScale(Q_new)} y={yScale(0)+15} textAnchor="middle" className="text-xs font-bold fill-slate-700 svg-symbol">Q<tspan dy="0.3em" fontSize="70%">1</tspan></text>

                        {/* 最终均衡点标记 (E1) */}
                        <circle 
                            cx={xScale(Q_new)} 
                            cy={yScale(P_consumer_pay)} 
                            r="6" 
                            fill="#22c55e" 
                            stroke="white" 
                            strokeWidth="2"
                        />
                        <text x={xScale(Q_new)+10} y={yScale(P_consumer_pay)} className="text-sm font-bold fill-green-600 svg-symbol">E<tspan dy="0.3em" fontSize="70%">1</tspan></text>
                    </svg>

                </div>

                {/* 右侧：控制与分析 */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* 1. 征税对象选择 */}
                    <div className={`bg-white p-5 rounded-xl shadow-md border border-slate-100 ${lockTarget ? 'disabled-input' : ''}`}>
                        <h3 className="font-bold text-slate-700 mb-4">
                            1. 选择征税对象
                        </h3>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 cursor-pointer">
                                <input
                                    type="radio" name="taxTarget" value="producer" checked={taxTarget === 'producer'}
                                    onChange={() => setTaxTarget('producer')} disabled={lockTarget && taxTarget !== 'producer'}
                                    className="form-radio text-blue-600 h-4 w-4 transition duration-150 ease-in-out"
                                />
                                <span>对生产者征税</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 cursor-pointer">
                                <input
                                    type="radio" name="taxTarget" value="consumer" checked={taxTarget === 'consumer'}
                                    onChange={() => setTaxTarget('consumer')} disabled={lockTarget && taxTarget !== 'consumer'}
                                    className="form-radio text-blue-600 h-4 w-4 transition duration-150 ease-in-out"
                                />
                                <span>对消费者征税</span>
                            </label>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            {lockTarget ? `当前场景已锁定为: ${currentScenario.targetLabel}` : '* 税负归宿与法定归宿无关。'}
                        </p>
                    </div>


                    {/* 2. 参数控制器 */}
                    <div className="bg-white p-5 rounded-xl shadow-md border border-slate-100 space-y-6">
                        <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                            <TrendingUp size={18} />
                            2. 参数调整
                        </h3>
                        
                        {/* 需求弹性滑块 */}
                        <div className={lockEd ? 'disabled-input' : ''}>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">需求弹性 (<MathDisplay latex="Ed" />)</label>
                                <span className={`text-sm font-bold ${lockEd ? 'text-slate-500' : 'text-blue-600'}`}>{Ed.toFixed(1)}</span>
                            </div>
                            <input 
                                type="range" min="0.1" max="5.0" step="0.1" value={Ed}
                                onChange={(e) => { setEd(parseFloat(e.target.value)); }} disabled={lockEd}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>无弹性 (陡峭)</span>
                                <span>有弹性 (平坦)</span>
                            </div>
                            {lockEd && <p className="text-xs text-red-400 mt-1">当前场景已固定 <MathDisplay latex={`Ed=${currentScenario.Ed.toFixed(1)}`} /></p>}
                        </div>

                        {/* 供给弹性滑块 */}
                        <div className={lockEs ? 'disabled-input' : ''}>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">供给弹性 (<MathDisplay latex="Es" />)</label>
                                <span className={`text-sm font-bold ${lockEs ? 'text-slate-500' : 'text-amber-600'}`}>{Es.toFixed(1)}</span>
                            </div>
                            <input 
                                type="range" min="0.1" max="5.0" step="0.1" value={Es}
                                onChange={(e) => { setEs(parseFloat(e.target.value)); }} disabled={lockEs}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                                style={{ accentColor: '#d97706' }}
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>无弹性 (陡峭)</span>
                                <span>有弹性 (平坦)</span>
                            </div>
                            {lockEs && <p className="text-xs text-red-400 mt-1">当前场景已固定 <MathDisplay latex={`Es=${currentScenario.Es.toFixed(1)}`} /></p>}
                        </div>

                        {/* 税额滑块 */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">单位税额 (Tax)</label>
                                <span className="text-sm font-bold text-slate-600">{taxAmount}</span>
                            </div>
                            <input 
                                type="range" min="0" max="40" step="1" 
                                value={taxAmount}
                                onChange={(e) => setTaxAmount(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                            />
                        </div>
                    </div>

                    {/* 3. 结果分析面板 */}
                    <div className="bg-slate-800 text-white p-5 rounded-xl shadow-md">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Info size={18} />
                            3. 税负归宿分析
                        </h3>
                        
                        {/* 份额条 */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-purple-300">消费者承担 (买价上涨)</span>
                                    <span className="font-bold">{consumerShare.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${consumerShare}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-amber-300">生产者承担 (卖价下跌)</span>
                                    <span className="font-bold">{producerShare.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${producerShare}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* 分析结果 */}
                        <div className="mt-6 pt-4 border-t border-slate-700 text-sm leading-relaxed text-slate-300">
                            <p className="mb-2">
                                <strong className="text-white">经济学原理：</strong>
                            </p>
                            <p className="text-yellow-400">
                                “税负最终由<strong className="text-white">缺乏弹性</strong>（曲线更陡峭）的一方承担更多。”
                            </p>
                            {(() => {
                                const EdFixed = Ed.toFixed(1);
                                const EsFixed = Es.toFixed(1);
                                // 使用一个小的容差进行浮点数比较
                                const isEqual = Math.abs(Ed - Es) < 0.01;

                                if (isEqual) {
                                    return (
                                        <p className="mt-3">
                                            当前市场中，<strong className="text-white">需求方与供给方</strong> 弹性相等 (<MathDisplay latex={`Ed=${EdFixed}`} /> = <MathDisplay latex={`Es=${EsFixed}`} />)，
                                            因此 <strong className="text-white">消费者和生产者</strong> 承担了相同比例的税负。
                                        </p>
                                    );
                                } else if (Ed < Es) {
                                    return (
                                        <p className="mt-3">
                                            当前市场中，
                                            <strong className="text-white">需求方</strong> 的弹性更小 (<MathDisplay latex={`Ed=${EdFixed} < Es=${EsFixed}`} />)，
                                            因此 <strong className="text-white">消费者</strong> 承担了更大比例的税负。
                                        </p>
                                    );
                                } else { // Es < Ed
                                    return (
                                        <p className="mt-3">
                                            当前市场中，
                                            <strong className="text-white">供给方</strong> 的弹性更小 (<MathDisplay latex={`Es=${EsFixed} < Ed=${EdFixed}`} />)，
                                            因此 <strong className="text-white">生产者</strong> 承担了更大比例的税负。
                                        </p>
                                    );
                                }
                            })()}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};