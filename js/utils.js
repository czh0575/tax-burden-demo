// js/utils.js
const { useState, useEffect, useMemo } = React;

// --- 1. KaTeX 渲染组件 ---
const MathDisplay = ({ latex, className = "" }) => {
    const ref = React.useRef(null);

    useEffect(() => {
        if (ref.current) {
            try {
                let processedLatex = latex.replace(/Ed/g, '\\text{E}_d').replace(/Es/g, '\\text{E}_s');
                processedLatex = processedLatex.replace(/P0/g, 'P_0').replace(/Pc/g, 'P_c').replace(/Pp/g, 'P_p');
                
                katex.render(processedLatex, ref.current, {
                    throwOnError: false,
                    displayMode: false, 
                });
            } catch (error) {
                ref.current.textContent = latex; 
                console.error("KaTeX render error:", error);
            }
        }
    }, [latex]);

    return <span ref={ref} className={className} />;
};

// --- 2. 内嵌图标组件 ---
const BookOpen = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>);
const BarChart3 = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>);
const RefreshCw = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>);
const TrendingUp = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>);
const Info = ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>);

// --- 3. 核心经济学计算逻辑 ---
const calculateEconomy = (taxAmount, Ed, Es) => {
    const P0 = CHART_DIMENSIONS.P0;
    const Q0 = CHART_DIMENSIONS.Q0;

    const combinedElasticity = (1/Ed) + (1/Es);
    if (combinedElasticity === 0) return { Q_new: Q0, P_consumer_pay: P0, P_producer_get: P0, consumerShare: 0, producerShare: 0 }; 

    // 1. 新均衡数量 (Q1)
    const Q_new = Math.max(0, Q0 - taxAmount / combinedElasticity);

    // 2. 消费者支付价格 (Pc)
    const P_consumer_pay = P0 + (Q0 - Q_new) / Ed; 
    
    // 3. 生产者获得价格 (Pp)
    const P_producer_get = P0 + (Q_new - Q0) / Es; 

    // 4. 税负归宿
    const consumerBurden = (P_consumer_pay - P0) * Q_new;
    const producerBurden = (P0 - P_producer_get) * Q_new;
    const totalTax = consumerBurden + producerBurden;
    
    const consumerShare = totalTax > 0 ? (consumerBurden / totalTax) * 100 : 0;
    const producerShare = totalTax > 0 ? (producerBurden / totalTax) * 100 : 0;

    return { Q_new, P_consumer_pay, P_producer_get, consumerShare, producerShare };
};


// --- 4. 绘图坐标转换工具 ---

// 数量 Q (0-100) -> 像素 x
const xScale = (val) => {
    const { width, padding } = CHART_DIMENSIONS;
    return padding + val * ((width - padding * 2) / 100);
};

// 价格 P (0-100) -> 像素 y
const yScale = (val) => {
    const { height, padding } = CHART_DIMENSIONS;
    return height - padding - val * ((height - padding * 2) / 100);
};

// 生成曲线路径点
const generatePath = (isDemand, elasticity, taxTarget, shift = 0) => {
    const Q0 = CHART_DIMENSIONS.Q0;
    let points = [];
    for (let q = 0; q <= 100; q += 2) {
        let p;
        if (isDemand) {
            // 需求曲线: P = P0 + (Q0 - Q) / Ed
            p = Q0 + (Q0 - q) / elasticity; 
            if (taxTarget === 'consumer' && shift > 0) {
                p -= shift; // 对消费者征税，D曲线垂直下移 (P - Tax)
            }
        } else {
            // 供给曲线: P = P0 + (Q - Q0) / Es
            p = Q0 + (q - Q0) / elasticity; 
            if (taxTarget === 'producer' && shift > 0) {
                p += shift; // 对生产者征税，S曲线垂直上移 (P + Tax)
            }
        }
        if (p >= -10 && p <= 110) {
            points.push(`${xScale(q)},${yScale(p)}`);
        }
    }
    return points.join(" ");
};