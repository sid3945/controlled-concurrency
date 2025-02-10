import fetch from "node-fetch";

async function api(id) {
  const start = Date.now();
  const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
  const json = await response.json();
  const timeTaken = Date.now() - start;
  console.log(`Fetched ID: ${id} in ${timeTaken}ms`);
  return { ...json, timeTaken };
}

async function measureTime(fn, label) {
  const startTime = Date.now();
  const result = await fn();
  const totalTime = Date.now() - startTime;
  console.log(`\n${label} completed in ${totalTime}ms\n`);
  return result;
}

async function sequentialExecution() {
  let results = [];
  for (let i = 1; i <= 100; i++) {
    results.push(await api(i));
  }
  return results;
}


async function concurrentExecution() {
  const requests = Array.from({ length: 100 }, (_, i) => api(i + 1));
  return await Promise.all(requests);
}


async function processItemsWithConcurrency(concurrency = 10) {
  const results = [];
  let currentIndex = 0;

  async function worker() {
    while (true) {
      const index = currentIndex
      currentIndex++

      if (index >= 100) break

      results[index] = await api(index)
    }
  }
  const workers = []
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker())
  }

  await Promise.all(workers)
  return results
}

(async () => {
  console.log("\nStarting Sequential Execution...");
  await measureTime(sequentialExecution, "Sequential Execution");

  console.log("\nStarting Concurrent Execution...");
  await measureTime(concurrentExecution, "Concurrent Execution");

  console.log("\nStarting Controlled Concurrency (10 at a time)...");
  await measureTime(() => processItemsWithConcurrency(10), "Batch Execution (10 at a time)");
})();
