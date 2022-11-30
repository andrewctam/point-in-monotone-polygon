const Point = (props) => {

    const handleClick = (e) => {
        e.stopPropagation();
        if (props.id === 0)
            props.closePolygon();
        else if (props.building)
            alert("To close the polygon, click on your first vertex.")
    }

return <div onClick = {handleClick} className = {`w-6 h-6 z-10 rounded-xl absolute text-white text-center`} style = {{left: props.x + "px", top: props.y + "px", backgroundColor: props.color}}>
        {props.id}
    </div>
}


export default Point;