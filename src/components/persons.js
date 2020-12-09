import React from 'react';
import '../styles/persons.css';
import { Row, Col, Button , AutoComplete } from 'antd';
import {PersonsList} from "../services/agencyAPI";
const numbers = [2,3,4,5,6,7] ;
const doubled = numbers.map((number, listKey) => {
     return <li style={{color : 'red'}} key={listKey}>{number}</li>
}); 



export default class Persons extends React.Component {
    state = {
        persons: [],
        loading: true,
        error: false,
    };


  uiCLick = () => {
    this.props.history.number.push('2');
  };
    async componentDidMount() {
        try {
            const persons = await PersonsList();
            console.log(persons + 'Inside catch');
            this.setState({ persons, loading: false });
        } catch (err) {
            console.log('outside catch', err);
            this.setState({ loading: false, error: true });
        }
    }

  render() {
    
    return (
<div>

   <ul>{doubled}</ul>
                    <Row>
                        <Col span={6}>col-12</Col>
                        <Col span={6}>
                            <div className="list" >
                                <p>something</p>
                                <p>something</p>
                                <p>something</p>
                            </div>
                        </Col>
                        <Col span={12} >
                            <header className="App-header">
                                <AutoComplete
                                    style={{
                                        width: 200,
                                        display : "inline",
                                        position : "relative"
                                    }}
                                    placeholder="input here"
                                    
                                >
                                </AutoComplete>
                                <Button onClick = "personsAdd()" style={{display : "inline", position : "relative"}} type="primary">Button</Button>
                                <br />
                            </header>
                        </Col>
                    </Row>  

                 <table id="customers">
                     <tbody>
                    <tr >
                     <th>ID</th>
                     <th>Username</th>
                     <th>Name</th>
                     <th >Email</th>
                    </tr>
                     {typeof this.state.persons !== 'undefined' &&  this.state.persons.map((person ,personKey) => (
                    <tr key= {personKey}>
                    <td>{person.id}</td>
                    <td>{person.username}</td>
                     <td>{person.name}</td>
                     <td>{person.email}</td>
                    </tr>
                                                        ))}
                                                        </tbody>
                </table>                     
 </div>

    )
  }
}
