import React from "react";
import "./Masonry.css";

const Masonry = ({ children }) => {
  if (!children || !Array.isArray(children)) {
    return <div className="masonry-container">No images to display.</div>;
  }

  // Calculate the number of columns based on screen size (responsive)
  const columnCount = getColumnCount();

  // Split children into columns (Pinterest-style)
  const columns = Array.from({ length: columnCount }, () => []);
  children.forEach((child, index) => {
    columns[index % columnCount].push(child);
  });

  return (
    <div className="masonry-container">
      <div className="masonry-columns">
        {columns.map((column, index) => (
          <div key={index} className="masonry-column">
            {column.map((item, itemIndex) => (
              <div key={itemIndex} className="masonry-item">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to determine column count based on screen width
const getColumnCount = () => {
  if (window.innerWidth <= 480) return 1; // Mobile: 1 column
  if (window.innerWidth <= 768) return 2; // Tablet: 2 columns
  if (window.innerWidth <= 1024) return 3; // Small desktop: 3 columns
  return 4; // Large desktop: 4 columns
};

export default Masonry;
