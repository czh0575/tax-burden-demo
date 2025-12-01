// js/constants.js

// 场景数据定义
const SCENARIOS = {
    producer_low_supply: { target: 'producer', Ed: 1.0, Es: 0.5, taxAmount: 20, lockTarget: true, lockEd: true, lockEs: false,
        title: "场景四", targetLabel: "对生产者征税", changeLabel: "变动供给曲线" },
    consumer_low_demand: { target: 'consumer', Ed: 0.5, Es: 1.0, taxAmount: 20, lockTarget: true, lockEd: false, lockEs: true,
        title: "场景一", targetLabel: "对消费者征税", changeLabel: "变动需求曲线" },
    producer_high_demand: { target: 'producer', Ed: 2.0, Es: 1.0, taxAmount: 20, lockTarget: true, lockEd: false, lockEs: true,
        title: "场景三", targetLabel: "对生产者征税", changeLabel: "变动需求曲线" },
    consumer_high_supply: { target: 'consumer', Ed: 1.0, Es: 2.0, taxAmount: 20, lockTarget: true, lockEd: true, lockEs: false,
        title: "场景二", targetLabel: "对消费者征税", changeLabel: "变动供给曲线" },
    custom: { target: 'producer', Ed: 1.0, Es: 1.0, taxAmount: 20, lockTarget: false, lockEd: false, lockEs: false,
        title: "自定义", targetLabel: "自由选择征税对象", changeLabel: "自由调整弹性参数" },
};

// 显式定义场景键的顺序以确保按钮排列正确
const scenarioKeys = [
    'consumer_low_demand', // 场景一 (原场景二)
    'consumer_high_supply', // 场景二 (原场景四)
    'producer_high_demand', // 场景三 (不变)
    'producer_low_supply', // 场景四 (原场景一)
    'custom' // 自定义
];

// 绘图常量
const CHART_DIMENSIONS = {
    width: 600,
    height: 400,
    padding: 60,
    P0: 50, // 初始均衡价格
    Q0: 50, // 初始均衡数量
};