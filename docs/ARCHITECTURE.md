# MEGHNETRA Architecture

The implementation follows the six-layer direction in the SIH deck: Data Sources → Ingestion → Processing & Intelligence → Verification → Data & Analytics → User Applications.

## Locked stack
- Next.js + TypeScript + Tailwind/shadcn-style UI
- Node.js API + WebSocket transport
- Python NLP/ML pipeline
- PostgreSQL + PostGIS
- Kafka / Redis
- Mapbox + Cesium
- Docker
- Vercel frontend + Render backend

## Delivery order
1. Frontend experience and responsive shell using synthetic data.
2. Mapbox 2D weather layers and Cesium 3D globe.
3. Node API contracts + WebSocket stream.
4. PostgreSQL/PostGIS persistence and spatial queries.
5. Python intelligence and verification pipeline.
6. Kafka/Redis streaming, caching and resilience.
7. Dockerized production deployment.
