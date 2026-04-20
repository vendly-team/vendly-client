import { products } from './products';
import { categories } from './categories';

export { products, categories };

export const featuredProducts = products.filter(p => ['1','7','12','14','8','5'].includes(p.id));
export const saleProducts = products.filter(p => p.salePrice !== undefined);
export const newArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
