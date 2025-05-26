import React, { useState } from 'react';
import logo from "/public/logo.png"
import { Card, Form, Button, Container, Col} from 'react-bootstrap';
import { useNavigate } from'react-router-dom';
import { AlertDangerComponent } from "../../components/alert/alert.jsx";
import "bootstrap/dist/css/bootstrap.min.css"
import useLoginAdminHooks from "../../hooks/login.jsx"
import "./Login.css"


const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState("")
    const navigate = useNavigate();


    const {login, error, loading} = useLoginAdminHooks()

    const HandleLogin = async (e) => {
        e.preventDefault();
        const response = await login(username, password);
        
        if (response.success) {
            navigate('/dashboard');
        } else {
            setLocalError(response.message);
        }
    }

    return (
        <>      
        <div className='login-wrapper'>
        <Card className="login-card">
            {(error || localError) && <AlertDangerComponent message={error || localError} />}
            <div id='logo'>
            <img src={logo} alt="logo" className="login-logo"/>
            </div>
            <Card.Body className='login-card-body'>
                <Card.Title className='login-card-title'>Login</Card.Title>
                
                <Form className='login-form' onSubmit={HandleLogin}>
                    <Form.Group className="mb-3" controlId="formUsername">
                        <Form.Label >username</Form.Label>
                        <Form.Control type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label>password</Form.Label>
                        <Form.Control type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div className='button btn-btn'>
                        <Button type="submit" className='login-button'>Login</Button>
                        <Button type="button" variant='secondary' onClick={() => navigate('/signup')} className='login-button'>SignUp</Button>
                        </div>
                    </Form.Group>
                </Form>
            </Card.Body>
        </Card>
        </div>
        </>
    )

}

export default LoginPage;

