FROM python:3.9-slim
WORKDIR /app
COPY ml_pipeline/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ml_pipeline/ .
CMD ["python", "inference.py"]
