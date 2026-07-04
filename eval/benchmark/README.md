# CyberDestiny Eval Benchmark

离线评测集骨架，用于 Chart Engine / LLM prompt / RAG 变更的 regression 测试。

## 目录结构

```
eval/
├── benchmark/
│   ├── README.md
│   ├── cases/           # 种子用例 JSON
│   ├── expected/        # 期望主题/象意（人工标注）
│   └── runner.ts        # CI regression runner（Phase 1+）
└── package.json
```

## 目标

- 相对真人命理师 **7–8 成** 可读准度
- 每版引擎变更须跑 regression
- Phase 0: ≥20 条种子用例

## 运行（Phase 1+）

```bash
pnpm --filter @cyberdestiny/eval test
```
