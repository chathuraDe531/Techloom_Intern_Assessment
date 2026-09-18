// Curated high-resolution Unsplash product photography by category and keywords
// Fast, reliable, crisp, and realistic retail imagery

const CATEGORY_IMAGES = {
  electronics: [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', // Smartwatch
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', // Headphones
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80', // Smartphone
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=600&q=80', // Earbuds
  ],
  computers: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', // Laptop
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80', // Keyboard
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80', // Mouse
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80', // Monitor
  ],
  clothing: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', // T-Shirt
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', // Red Nike Sneakers
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', // Jacket
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', // Backpack
  ],
  food: [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', // Artisan Coffee
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', // Green Tea
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80', // Pastry/Snack
  ],
  books: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80', // Book stack
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', // Book cover
  ],
  general: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', // Minimalist Watch
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80', // Audio gear
    'https://images.unsplash.com/photo-1507764923504-cd90bf7da772?auto=format&fit=crop&w=600&q=80', // Minimalist desk item
  ],
};

export const guessCategory = (name = '') => {
  const lower = name.toLowerCase();
  if (/phone|mobile|tablet|ipad|samsung|apple|xiaomi|headphone|earbud|watch|audio|speaker/.test(lower)) {
    return 'Electronics';
  }
  if (/laptop|computer|pc|desktop|keyboard|mouse|monitor|drive|ssd|ram/.test(lower)) {
    return 'Computers';
  }
  if (/shirt|pant|dress|jacket|shoe|sneaker|wear|cloth|backpack|bag|wallet|belt/.test(lower)) {
    return 'Clothing';
  }
  if (/coffee|tea|juice|snack|drink|food|water|bottle|biscuit/.test(lower)) {
    return 'Food & Drinks';
  }
  if (/book|novel|guide|manual|journal|notebook/.test(lower)) {
    return 'Books';
  }
  return 'General';
};

// Returns a high quality crisp product image matching the product name or category
export const getProductImage = (name = '') => {
  const lower = name.toLowerCase();

  // Specific keyword direct matches for instant recognition
  if (/keyboard/.test(lower)) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80';
  if (/mouse/.test(lower)) return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80';
  if (/laptop|macbook/.test(lower)) return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80';
  if (/monitor|screen|display/.test(lower)) return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80';
  if (/phone|iphone|galaxy|smartphone/.test(lower)) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80';
  if (/headphone|headset|earphone/.test(lower)) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
  if (/watch/.test(lower)) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
  if (/shoe|sneaker/.test(lower)) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
  if (/backpack|bag/.test(lower)) return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80';
  if (/coffee|mug/.test(lower)) return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
  if (/tea/.test(lower)) return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80';
  if (/book|notebook|journal/.test(lower)) return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';
  if (/shirt|tee/.test(lower)) return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';

  // Category fallback with deterministic hash
  const cat = guessCategory(name).toLowerCase();
  const pool = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.general;
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
};
