import Draw from './Draw';

function App() {
  
    return (
        <div className = "bg-blue-300">
           <h1 className="pt-5 text-center text-3xl ">Check if Point is Inside X Monotone Polygon</h1>
            <p className="pb-5 text-center">Click to add points to the polygon! Once you close the polygon, click anywhere to add a point to test if it is inside the polygon or not.</p>
            <Draw />
        </div>
    );
}

export default App;
