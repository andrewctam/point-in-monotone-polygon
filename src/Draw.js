import Point from './Point';
import Edge from './Edge';
import { useState, useEffect } from "react";
import { process, pointInsidePolygon } from './inside';

function Draw() {
    const [points, setPoints] = useState([]);
    
    const [currentPoint, setCurrentPoint] = useState(null);

    const [building, setBuilding] = useState(true);
    const [sorted, setSorted] = useState([]);

    const [steps, setSteps] = useState([]);

    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        setCurrentStep(0);
    }, [steps, currentPoint, building])


    const createPoint = (e) => {
        const x = e.nativeEvent.offsetX - 8
        const y = e.nativeEvent.offsetY - 8
        console.log(x + " " + y)

        if (building)
            setPoints([...points, {x: x, y: y, index: points.length}]);
        else {
            setCurrentPoint({x: x, y: y});
            setSteps(pointInsidePolygon(sorted, {x: x, y: -y, index: points.length}));
        }
    }
    
    const closePolygon = () => {            
        setBuilding(false)
        setSorted(process(points));
    }

    const undo = (e) => {
        if (e.keyCode === 8) {
             setSteps([]);
            if (currentPoint)
                setCurrentPoint(null);
            else if (building) {
                setPoints(points.slice(0, points.length - 1));    
            } else
                setBuilding(true)
        }
    }

    const formatStep = (step) => {
        debugger;
        switch (step.type) {
            case "MinMax":
                return `Find the min and max x values of the polygon, which are vertices ${step.min} and ${step.max}.`;
            case "SearchTop":
                return "Along the top chain, do binary search to find the edge that the point is between.";
            case "SearchBottom":
                return "Repeat for the bottom chain.";
            case "Above Max":
                return "Point is right of the maximum x value of the polygon."
            case "Below Min":
                return "Point is left of the minimum x value of the polygon."
            
            case "Binary Search":
                return `Binary Search: ${step.min} to ${step.max}`;
            case "Left On":
                return `Left Test: the point is left of ${step.a} ${step.b}`;
            case "Left Not On":
                return `Left Test: the point is not left of ${step.a} ${step.b}`;
            case "Between Left":
            case "Between Right":
                return `Found that the vertex is between ${step.min} and ${step.max}`;
            case "result":
                if (step.result)
                    return "Therefore, the point is inside the polygon";
                else
                    return "Therefore, the point is not inside the polygon";

            default: return "";
        }
    }

    if (currentStep < steps.length) {
        var step = steps[currentStep];
    }

    const edges = []
    for (let i = 0; i < points.length - 1; i++) {
        let color = "black";
        
        if (step)
            switch(step.type) {
                case "Left On":
                case "Left Not On":
                    if (step.a === i)
                        color = "red"
                    break;               
            }
            

        edges.push (
            <Edge
                key = {"edge" + i}
                id = {i}
                color = {color}
                x1 = {points[i].x + 8}
                x2 = {points[i + 1].x + 8}
                y1 = {points[i].y + 8}
                y2 = {points[i + 1].y + 8} />
        )

    }

    if (!building)  {
        let color = "black";
        if (step)
            switch(step.type) {
                case "Left On":
                case "Left Not On":
                    if (step.a === points.length - 1)
                        color = "red"
                    break;               
            }

        edges.push(
            <Edge
                key = {"edge" + points.length}
                color = {color}
                id = {points.length}
                x1 = {points[0].x + 8}
                x2 = {points[points.length - 1].x + 8}
                y1 = {points[0].y + 8}
                y2 = {points[points.length - 1].y + 8} 
            />
        )
    }



    
    return (
        <div onClick={createPoint} onKeyDown = {undo} tabIndex = {-1} className="relative w-full h-[200vh] select-none bg-sky-200">

            {steps.length > 0 ? 
                <>
                    {currentStep < steps.length ? 
                    <p className = "text-black text-center text-xl p-2 bg-white">{formatStep(step)}</p> : null}

                    <button disabled = {currentStep <= 0} className = "p-2 m-2 border border-black disabled:bg-gray-100 bg-red-200 rounded" onClick = {(e) => {e.stopPropagation(); setCurrentStep(currentStep - 1)}}>
                        Previous Step
                    </button>

                    <button disabled = {currentStep >= steps.length - 1} className = "p-2 m-2 border border-black disabled:bg-gray-100 bg-green-200 rounded" onClick = {(e) => {e.stopPropagation(); setCurrentStep(currentStep + 1)}}>
                        Next Step
                    </button> 
                </>
            : null}

            {points.map((point, i) =>  {
                let color = "black"
                
                if (step)
                    switch(step.type) {
                        case "Binary Search":
                        case "Between Left":
                        case "Between Right":
                        case "MinMax":
                            if (step.min === i || step.max === i)
                                color = "red"
                            break;
                        case "Above Max":
                            if (step.higher === i)
                                color = "red"
                            break;
                        case "Below Min":
                            if (step.lower === i)
                                color = "red"
                            break;
                    }
                    


                return <Point 
                    id = {i} 
                    key = {"vertex" + i} 
                    color = {color}
                    x = {point.x}
                    y = {point.y} 
                    building = {building}
                    closePolygon = {closePolygon}/>
                }
            )}


            {currentPoint ?
                <Point 
                id = {"p"}
                key = {"current"}
                color = {"blue"}
                x = {currentPoint.x}
                y = {currentPoint.y}
                building = {building}
                closePolygon = {() => {}}/> : null  
            }

            {edges}

        </div>
    );
  
    
}

export default Draw;
