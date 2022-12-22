
const VerticalLine = (props) => {

    return <div onClick = {(e) => {e.stopPropagation();}}className = {"z-0 bg-black/5 absolute"} 
        style = {{
            width: "2px",
            left: props.x,
            top: 0,
            height: "200vh"
        }} />

}

export default VerticalLine;