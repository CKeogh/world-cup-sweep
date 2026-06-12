import "./LoadingSpinner.css";

function LoadingSpinner() {
  return (
    <div className="spinner">
      <div className="spinner-ring" />
      <p className="spinner-text">Loading...</p>
    </div>
  );
}

export default LoadingSpinner;
