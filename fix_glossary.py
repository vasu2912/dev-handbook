import re

with open("src/content/docs/reference/system-design-glossary.md", "r") as f:
    text = f.read()

replacements = [
    (r'\[dns\]\(/system-design/\)', r'[dns](/system-design/dns/)'),
    (r'\[cdn\]\(/system-design/\)', r'[cdn](/system-design/cdn/)'),
    (r'\[asynchronism\]\(/backend/concurrency/\)', r'[asynchronism](/system-design/asynchronous-processing/)'),
    (r'\[concurrency vs parallelism\]\(/backend/concurrency/\)', r'[concurrency vs parallelism](/backend/concurrency/concurrency-and-parallelism/)'),
    (r'\[threads\]\(/backend/concurrency/\)', r'[threads](/backend/concurrency/threads/)'),
    (r'\[event loop\]\(/backend/concurrency/\)', r'[event loop](/backend/concurrency/event-loop/)'),
    (r'\[goroutines\]\(/backend/concurrency/\)', r'[goroutines](/backend/concurrency/goroutines/)'),
    (r'\[race conditions\]\(/backend/concurrency/\)', r'[race conditions](/backend/concurrency/race-conditions/)'),
    (r'\[rest theory\]\(/backend/api-design/\)', r'[rest theory](/backend/api-design/rest/)'),
    (r'\[api design overview\]\(/backend/api-design/\)', r'[api design overview](/backend/api-design/)'), # leave as is if no better map
    (r'\[http methods idempotency\]\(/backend/api-design/\)', r'[http methods idempotency](/backend/api-design/methods-and-idempotency/)'),
    (r'\[url design\]\(/backend/api-design/\)', r'[url design](/backend/api-design/url-design/)'),
    (r'\[list apis\]\(/backend/api-design/\)', r'[list apis](/backend/api-design/list-apis/)'),
    (r'\[crud endpoints\]\(/backend/api-design/\)', r'[crud endpoints](/backend/api-design/crud-endpoints/)'),
    (r'\[handlers controllers\]\(/system-design/\)', r'[handlers controllers](/backend/architecture/handlers-and-controllers/)'),
    (r'\[services\]\(/system-design/\)', r'[services](/backend/architecture/services/)'),
    (r'\[repositories\]\(/system-design/\)', r'[repositories](/backend/architecture/repositories/)'),
    (r'\[middleware\]\(/system-design/\)', r'[middleware](/backend/architecture/middleware/)'),
    (r'\[request context\]\(/system-design/\)', r'[request context](/backend/architecture/request-context/)'),
    (r'\[reverse proxy\]\(/system-design/load-balancing/\)', r'[reverse proxy](/system-design/reverse-proxy/)'),
]

for old, new in replacements:
    text = re.sub(old, new, text)

with open("src/content/docs/reference/system-design-glossary.md", "w") as f:
    f.write(text)

print("Done")
