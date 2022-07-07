import './App.css';
import { World } from './component/three/test'
import { AddWish, GetWishes } from './component/firebase/controller';
import { Button, Container, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';


function App() {
  const [inputNameValue, setInputNameValue] = useState("");
  const [inputWishValue, setInputWishValue] = useState("");
  const [allWishes, setAllWishes] = useState([]); 

  useEffect(()=>{
    getWishes();
  },[]); 

  //get wishes
  const getWishes = () => {
    GetWishes().then((snapshots)=>{
      let wishes = new Array();
      snapshots.forEach((wish)=>{
        wishes.push(wish.data());
      });
      setAllWishes(wishes);
    });
  }

  //submit wish
  const onSubmitWish = (e) => {
    e.preventDefault();
    if(inputWishValue==="" || inputNameValue===""){
      console.error("wish or name is empty");
    }else{
      AddWish(inputNameValue, inputWishValue).then(()=>{
        setInputWishValue("");
        getWishes();
      });
    }
  }
  
  
  return (
    <div className="App"> 
      <Container>
        <Row>
          <h1>七夕ってことで作り始めたけど飽きちゃった</h1>
          <small>願い事を書こう(?)</small>
        </Row>
        <World wishes={allWishes}></World>
        <div id="wishes">
          <details style={{backgroundColor: "lightGray"}}>
            <summary>願い事たち</summary>
            {
              allWishes.length===0 && <p>願いは一つもない。悲しいね...</p>
            }
            {
              allWishes.map((wish)=>(
                <div>
                  <small> {wish.name} </small>
                  :
                  <small> {wish.content} </small> 
                </div>
              ))
            }
          </details>
          
        </div>
        <form onSubmit={(e)=>{ onSubmitWish(e); }}>
          <Row>
            <label>
              名前:  
              <input type="text" name="name" value={inputNameValue} onChange={(e)=>{setInputNameValue(e.target.value);}} />
            </label>
          </Row>
          <Row>
            <label>
              願い:  
              <input type="text" name="content" value={inputWishValue} onChange={(e)=>{setInputWishValue(e.target.value);}} />
            </label>
          </Row>
          <Button type='submit' variant='primary'>送信</Button>          
        </form>
      </Container>
      
    </div>
  );
}

export default App;
