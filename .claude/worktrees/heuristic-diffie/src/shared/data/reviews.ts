export interface ReviewData {
  id: string;
  productId: string;
  customerId: string;
  userName: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const reviews: ReviewData[] = [
  { id: 'r1', productId: '1', customerId: 'c1', userName: 'Alex M.', rating: 5, text: 'Excellent refrigerator! The French door design is perfect for our kitchen. Very spacious inside.', status: 'approved', createdAt: '2025-06-06T10:00:00Z' },
  { id: 'r2', productId: '1', customerId: 'c3', userName: 'Mike C.', rating: 4, text: 'Great fridge overall. Ice maker works well. Wish the door bins were a bit bigger.', status: 'approved', createdAt: '2025-06-04T10:00:00Z' },
  { id: 'r3', productId: '7', customerId: 'c2', userName: 'Sarah J.', rating: 5, text: 'The picture quality is absolutely stunning. Best TV I have ever owned.', status: 'approved', createdAt: '2025-06-07T10:00:00Z' },
  { id: 'r4', productId: '7', customerId: 'c7', userName: 'David L.', rating: 5, text: 'Amazing colors and contrast. Samsung QLED is worth every penny.', status: 'approved', createdAt: '2025-06-05T10:00:00Z' },
  { id: 'r5', productId: '12', customerId: 'c3', userName: 'Mike C.', rating: 4, text: 'Powerful suction and the laser detection is a cool feature. Battery life could be better.', status: 'approved', createdAt: '2025-06-08T10:00:00Z' },
  { id: 'r6', productId: '14', customerId: 'c6', userName: 'Lisa A.', rating: 5, text: 'A kitchen essential! Makes baking so much easier. Love the design.', status: 'approved', createdAt: '2025-06-03T10:00:00Z' },
  { id: 'r7', productId: '5', customerId: 'c6', userName: 'Lisa A.', rating: 4, text: 'Cools the room quickly and very energy efficient. Quiet operation.', status: 'approved', createdAt: '2025-06-02T10:00:00Z' },
  { id: 'r8', productId: '3', customerId: 'c4', userName: 'Emily D.', rating: 5, text: 'Best washer I have used. Clothes come out spotless every time.', status: 'pending', createdAt: '2025-06-09T10:00:00Z' },
  { id: 'r9', productId: '16', customerId: 'c3', userName: 'Mike C.', rating: 4, text: 'Makes great fries and chicken. Easy to clean. Highly recommend.', status: 'pending', createdAt: '2025-06-09T11:00:00Z' },
  { id: 'r10', productId: '8', customerId: 'c7', userName: 'David L.', rating: 5, text: 'OLED blacks are incredible. The picture quality blows me away every time.', status: 'approved', createdAt: '2025-06-01T10:00:00Z' },
  { id: 'r11', productId: '13', customerId: 'c7', userName: 'David L.', rating: 3, text: 'Works okay but gets stuck under furniture sometimes. Self-emptying is nice.', status: 'approved', createdAt: '2025-06-04T10:00:00Z' },
  { id: 'r12', productId: '15', customerId: 'c2', userName: 'Sarah J.', rating: 4, text: 'Powerful blender for the price. Makes smooth smoothies.', status: 'pending', createdAt: '2025-06-08T14:00:00Z' },
  { id: 'r13', productId: '2', customerId: 'c6', userName: 'Lisa A.', rating: 5, text: 'The InstaView feature is genius. Very roomy and well organized inside.', status: 'approved', createdAt: '2025-05-28T10:00:00Z' },
  { id: 'r14', productId: '9', customerId: 'c1', userName: 'Alex M.', rating: 3, text: 'Good microwave but the convection feature heats unevenly sometimes.', status: 'rejected', createdAt: '2025-06-07T10:00:00Z' },
  { id: 'r15', productId: '11', customerId: 'c1', userName: 'Alex M.', rating: 4, text: 'Very quiet dishwasher. Does a thorough job cleaning. Easy to load.', status: 'pending', createdAt: '2025-06-09T16:00:00Z' },
];
