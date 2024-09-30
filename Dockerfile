FROM python:3.10
WORKDIR /app
RUN apt-get update && apt-get install -y vim
CMD ["python", "app.py"]
RUN echo "test content" > TestFile.txt
EXPOSE 8000
CMD ["python", "-m", "http.server", "8000"]