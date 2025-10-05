import docx
import pdfplumber
import io

async def get_doc_contents(file):
    ext = file.headers['content-type']
    doc_bytes = await file.read()
    if "vnd.openxmlformats-officedocument.wordprocessingml.document" in ext:
        print("document is docx file")
        document = docx.Document(io.BytesIO(doc_bytes))
        contents = "\n".join([para.text for para in document.paragraphs])
    elif "pdf" in ext:
        print("document is pdf file")
        pdf = pdfplumber.open(io.BytesIO(doc_bytes))
        pages = pdf.pages
        contents = "\n".join([page.extract_text() for page in pages])
    elif "txt" in ext:
        contents = doc_bytes.decode("utf-8")
    return contents