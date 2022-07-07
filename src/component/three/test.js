import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { CanvasTexture, Color, Points, PointsMaterial, TextureLoader, Vector3 } from "three"
import { randFloat, randInt } from "three/src/math/MathUtils"

const sumVector3 = (vec1,vec2) => {
  let sum = [0,0,0];
  for(let i=0;i<3;i++){
    sum[i]=vec1[i]+vec2[i];
  }
  return sum;
}

const WishPaper = (props={texts: ["test"], position: [0,0,0], cameraPosition: [0,0,10]}) => {
  const mesh = useRef()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  //useFrame((state, delta) => (mesh.current.rotation.x += 0.01))
  const colorMap = useLoader(TextureLoader, 'images/test.jpeg');
  
  const maxWidth = 16;
  const maxHeight = 8;
  const [canSize, setCanSize] = useState([maxWidth, maxHeight]);

  const [textTexture, setTextTexture] = useState(null);

  const cameraFaceOffset = [0,0,-30];
  const [position, setPosition] = useState(props.position)
  const [cameraPosition, setcameraPosition] = useState(props.cameraPosition)
  const [cameraFacePosition, setCameraFacePosition] = useState( [0,0,0] )//sumVector3(cameraPosition, cameraFaceOffset));

  useEffect(()=>{
    setCameraFacePosition(sumVector3(cameraPosition, cameraFaceOffset));
    
  });

  useEffect(()=>{
    const tcan = TextCanvas(props.texts);
    const ttexture = new CanvasTexture(tcan);
    setTextTexture(ttexture);

    const ratio = tcan.height / tcan.width;

    if(ratio > maxHeight/maxWidth){
      setCanSize([maxHeight/ratio,maxHeight]);
    }else{
      setCanSize([maxWidth,ratio*maxWidth]);
    }
  }, []);

  

  //scale={active ? 10 : 1}
  return (
    <mesh
      {...props}
      position={active?cameraFacePosition:position}
      scale={1}
      ref={mesh}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <planeGeometry args={canSize}></planeGeometry>
      <meshStandardMaterial map={hovered?textTexture:textTexture} />
    </mesh>
  )
}


const TextCanvas = (texts_raw=[]) => {
  //limit char num per line
  const textLengthLimitPerLine = 16;
  let texts = new Array();
  texts_raw.forEach((text)=>{
    //console.log(text);
    while(text.length>textLengthLimitPerLine){
      texts.push(text.slice(0,textLengthLimitPerLine));
      text = text.slice(textLengthLimitPerLine);
    }
    texts.push(text);
  });

  //create canvas
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  const fontSize = 32;
  const margin = 20;
  const fontStyle = "serif";
  const font = `bold ${fontSize}px ${fontStyle}`;
  ctx.font=font;

  //check width and height
  let maxTextWidth = 0;
  texts.forEach((text)=>{
    let textMetrics = ctx.measureText(text);
    let twidth = textMetrics.width;
    //console.log(text, twidth);
    if(twidth > maxTextWidth){
      maxTextWidth = twidth;
    }
  });
  //console.log(maxTextWidth);
  canvas.width = maxTextWidth + 2 * margin;
  canvas.height = texts.length * fontSize + 2 * margin;

  ctx.fillStyle = `rgb(${randInt(100,255)},${randInt(100,255)},${randInt(100,255)})`;
  //ctx.fillStyle = `rgb(0,255,0)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign="center";
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.font = font;
  for(let i=0;i<texts.length;i++){
    ctx.fillText(texts[i], canvas.width/2, fontSize*(i+0.5)+margin, canvas.width);
  }
  
  return canvas;
}


export const World = (props={wishes: [{name: "name", content: "content"}]}) => {
  const [cameraPosition, setCameraPosition] = useState([0,0,100]);

  const calcPosition = (radius, angleH, height) => {
    let pos = [0,0,0];
    pos[0] = radius*Math.cos(angleH);
    pos[1] = height;
    pos[2] = radius*Math.sin(angleH);
    return pos;
  };

  //わかんね 
  const calcAngle = (position) => {
    let angle = [0,0,0];
    
    angle[0] = new Vector3(0,0,0).angleTo(new Vector3(0, position[1], position[2]));
    angle[1] = new Vector3(0,0,0).angleTo(new Vector3(position[0], 0, position[2]));
    angle[2] = new Vector3(0,0,0).angleTo(new Vector3(position[0], position[1], 0));

    //angle=[0,0,0];
    return angle;
  }

  const arrangeWishes = (wishes=[]) => {
    const arr = wishes.map((wish)=>({
      texts: [wish.name?`[${wish.name}]`:"", wish.content?wish.content:""],
      posision: calcPosition(30, randFloat(0,360), randFloat(30,0)),
    }));

    return (
      arr.map((ele)=>(
        <WishPaper 
          texts={ele.texts} 
          cameraPosition={cameraPosition}
          position={ele.posision} 
        ></WishPaper>
      ))
    )
  }

  //stars
  function Stars(props) {
    const ref = useRef()
    const [sphere] = useState(() => new Array(100).map(()=>{
      return [
        randFloat(-1000, 1000),
        randFloat(0.100),
        randFloat(-1000, 1000),
      ]
    }));
    useFrame((state, delta) => {
      ref.current.rotation.x -= delta / 10
      ref.current.rotation.y -= delta / 15
    })
    return (
      <group rotation={[0, 0, Math.PI / 4]}>
        <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
          <PointsMaterial transparent color="#ffa0e0" size={0.005} sizeAttenuation={true} depthWrite={false} />
        </Points>
      </group>
    )
  }

  const [arrangedWishes, setArrangedWishes] = useState();
  useEffect(()=>{
    setArrangedWishes(arrangeWishes(props.wishes));
  }, [props.wishes])

  return (
    <div>
      <div style={{width: "300px", height: "300px", margin: "auto"}}>
        <Canvas
          camera={{ fov: 50, position: cameraPosition}}
          color={"black"}
          style={{
            border: "solid 1px black",
            backgroundColor: "black",
          }}
        >
          
          <ambientLight intensity={1.0} />
          <group rotation={[0,0,0]}>  
            {
              arrangedWishes
            }
          </group>
        </Canvas>
      </div>
    </div>
  )
}



