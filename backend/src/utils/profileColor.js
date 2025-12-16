function generateRandomColor() {
  let r, g, b;
  do {
    r = Math.floor(Math.random() * 256); 
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
  } while (r > 200 && g > 200 && b > 200); 
  
  return `rgb(${r}, ${g}, ${b})`; 
}
 
export default generateRandomColor;