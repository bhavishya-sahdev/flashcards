import { initializeNewCard } from "./spaced-repetition";
import { FlashcardFolder } from "./types";

const now = new Date();
const spacedRepetitionDefaults = initializeNewCard();
export const defaultFolders: FlashcardFolder[] = [
  {
    id: "dsa-basics",
    name: "DSA Fundamentals",
    description: "Core data structures and algorithms concepts",
    createdAt: new Date(),
    flashcards: [
      {
        id: "1",
        question:
          "What is the time complexity of searching in a balanced Binary Search Tree?",
        answer:
          "O(log n) - In a balanced BST, we eliminate half the search space at each level, giving us logarithmic time complexity.",
        category: "Trees",
        difficulty: "Medium",
        codeTemplate: `// Implement BST search
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

function searchBST(root, target) {
    // Your implementation here
    if (!root) return null;
    
    if (root.val === target) {
        return root;
    } else if (target < root.val) {
        return searchBST(root.left, target);
    } else {
        return searchBST(root.right, target);
    }
}

// Test the function
const root = new TreeNode(4);
root.left = new TreeNode(2);
root.right = new TreeNode(7);
root.left.left = new TreeNode(1);
root.left.right = new TreeNode(3);

console.log("Searching for 2:", searchBST(root, 2)?.val);
console.log("Searching for 5:", searchBST(root, 5));`,
        createdAt: now,
        updatedAt: now,
        easeFactor: spacedRepetitionDefaults.easeFactor!,
        interval: spacedRepetitionDefaults.interval!,
        repetitions: spacedRepetitionDefaults.repetitions!,
        nextReviewDate: now, // Available for immediate review
        isLearning: spacedRepetitionDefaults.isLearning!,
        totalReviews: 0,
        correctReviews: 0,
        streakCount: 0,
        maxStreak: 0,
      },
      {
        id: "2",
        question: "Explain the difference between BFS and DFS traversal.",
        answer:
          "BFS (Breadth-First Search) explores nodes level by level using a queue, while DFS (Depth-First Search) goes as deep as possible before backtracking using a stack or recursion. BFS finds shortest paths in unweighted graphs; DFS is better for detecting cycles and topological sorting.",
        category: "Graph Traversal",
        difficulty: "Medium",
        codeTemplate: `// Implement BFS and DFS
function bfs(graph, start) {
    const visited = new Set();
    const queue = [start];
    const result = [];
    
    while (queue.length > 0) {
        const node = queue.shift();
        if (!visited.has(node)) {
            visited.add(node);
            result.push(node);
            queue.push(...(graph[node] || []));
        }
    }
    return result;
}

function dfs(graph, start, visited = new Set(), result = []) {
    if (!visited.has(start)) {
        visited.add(start);
        result.push(start);
        for (const neighbor of (graph[start] || [])) {
            dfs(graph, neighbor, visited, result);
        }
    }
    return result;
}

// Test with sample graph
const graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []
};

console.log("BFS traversal:", bfs(graph, 'A'));
console.log("DFS traversal:", dfs(graph, 'A'));`,
        createdAt: now,
        updatedAt: now,
        easeFactor: spacedRepetitionDefaults.easeFactor!,
        interval: spacedRepetitionDefaults.interval!,
        repetitions: spacedRepetitionDefaults.repetitions!,
        nextReviewDate: now, // Available for immediate review
        isLearning: spacedRepetitionDefaults.isLearning!,
        totalReviews: 0,
        correctReviews: 0,
        streakCount: 0,
        maxStreak: 0,
      },
      {
        id: "3",
        question:
          "What is a Hash Table and what is its average time complexity for operations?",
        answer:
          "A hash table is a data structure that maps keys to values using a hash function. Average time complexity: O(1) for insert, delete, and search operations. Worst case is O(n) when many collisions occur.",
        category: "Hashing",
        difficulty: "Easy",
        codeTemplate: `// Simple Hash Table implementation
class HashTable {
    constructor(size = 10) {
        this.size = size;
        this.buckets = new Array(size).fill(null).map(() => []);
    }
    
    hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash + key.charCodeAt(i) * i) % this.size;
        }
        return hash;
    }
    
    set(key, value) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        const existing = bucket.find(item => item[0] === key);
        
        if (existing) {
            existing[1] = value;
        } else {
            bucket.push([key, value]);
        }
    }
    
    get(key) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        const found = bucket.find(item => item[0] === key);
        return found ? found[1] : undefined;
    }
}

// Test the hash table
const ht = new HashTable();
ht.set("name", "Alice");
ht.set("age", 25);
console.log("Name:", ht.get("name"));
console.log("Age:", ht.get("age"));`,
        createdAt: now,
        updatedAt: now,
        easeFactor: spacedRepetitionDefaults.easeFactor!,
        interval: spacedRepetitionDefaults.interval!,
        repetitions: spacedRepetitionDefaults.repetitions!,
        nextReviewDate: now, // Available for immediate review
        isLearning: spacedRepetitionDefaults.isLearning!,
        totalReviews: 0,
        correctReviews: 0,
        streakCount: 0,
        maxStreak: 0,
      },
    ],
  },
  {
    id: "advanced-algos",
    name: "Advanced Algorithms",
    description: "Complex algorithms and optimization techniques",
    createdAt: new Date(),
    flashcards: [
      {
        id: "4",
        question: "Describe the Quick Sort algorithm and its time complexity.",
        answer:
          "Quick Sort is a divide-and-conquer algorithm that picks a pivot element and partitions the array around it. Average case: O(n log n), Worst case: O(n²) when pivot is always the smallest/largest element. Best case: O(n log n).",
        category: "Sorting",
        difficulty: "Hard",
        codeTemplate: `// Quick Sort implementation
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

// Test Quick Sort
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log("Original array:", testArray);
console.log("Sorted array:", quickSort([...testArray]));

// Performance test
const largeArray = Array.from({length: 1000}, () => Math.floor(Math.random() * 1000));
console.time("Quick Sort 1000 elements");
quickSort([...largeArray]);
console.timeEnd("Quick Sort 1000 elements");`,
        createdAt: now,
        updatedAt: now,
        easeFactor: spacedRepetitionDefaults.easeFactor!,
        interval: spacedRepetitionDefaults.interval!,
        repetitions: spacedRepetitionDefaults.repetitions!,
        nextReviewDate: now, // Available for immediate review
        isLearning: spacedRepetitionDefaults.isLearning!,
        totalReviews: 0,
        correctReviews: 0,
        streakCount: 0,
        maxStreak: 0,
      },
      {
        id: "5",
        question: "What is Dynamic Programming and when should you use it?",
        answer:
          "Dynamic Programming is an optimization technique that solves complex problems by breaking them into simpler subproblems and storing results to avoid redundant calculations. Use it when problems have: 1) Optimal substructure, 2) Overlapping subproblems. Examples: Fibonacci, Knapsack, LCS.",
        category: "Dynamic Programming",
        difficulty: "Hard",
        codeTemplate: `// Dynamic Programming: Fibonacci with memoization
function fibonacciDP(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 2) return 1;
    
    memo[n] = fibonacciDP(n - 1, memo) + fibonacciDP(n - 2, memo);
    return memo[n];
}

// Compare with naive recursive approach
function fibonacciNaive(n) {
    if (n <= 2) return 1;
    return fibonacciNaive(n - 1) + fibonacciNaive(n - 2);
}

// Performance comparison
console.log("DP Fibonacci(40):", fibonacciDP(40));
console.log("DP Fibonacci(50):", fibonacciDP(50));

// Uncomment to see the difference (warning: naive version is very slow)
// console.time("Naive Fibonacci(35)");
// console.log("Naive Fibonacci(35):", fibonacciNaive(35));
// console.timeEnd("Naive Fibonacci(35)");

console.time("DP Fibonacci(35)");
console.log("DP Fibonacci(35):", fibonacciDP(35));
console.timeEnd("DP Fibonacci(35)");`,
        createdAt: now,
        updatedAt: now,
        easeFactor: spacedRepetitionDefaults.easeFactor!,
        interval: spacedRepetitionDefaults.interval!,
        repetitions: spacedRepetitionDefaults.repetitions!,
        nextReviewDate: now, // Available for immediate review
        isLearning: spacedRepetitionDefaults.isLearning!,
        totalReviews: 0,
        correctReviews: 0,
        streakCount: 0,
        maxStreak: 0,
      },
    ],
  },
];
