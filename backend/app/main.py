from fastapi import FastAPI

app = FastAPI(title="Volo Manager API")

@app.get("/")
def health_check():
    return {"message": "Volo Manager API online"}