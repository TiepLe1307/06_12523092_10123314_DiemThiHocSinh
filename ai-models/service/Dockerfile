FROM python:3.12-slim

WORKDIR /app/ai-models/service

COPY ai-models/service/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ai-models/service/app ./app
COPY ai-models/service/tests ./tests
COPY ai-models/models ../models

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]