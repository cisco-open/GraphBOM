/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useEffect, useState } from 'react';
import '../App.css';
import { useHistory } from 'react-router-dom';
import { Menu, Image } from 'semantic-ui-react';

// import logo from '../logos/Cisco_logo.png';


const  NavBar = ({params}) => {
    const [active, setActive] = useState('Home');
    // const name = active;
    const history = useHistory();

    const handleItemClick = (e, {name}) =>{
        e.preventDefault();
        if (name === 'Home'){
            setActive(name);
            history?.push("/");
        }else if(name === 'Dashboard'){
            setActive(name);
            history?.push("/dashboard");
        }else if(name === 'Local Repos'){
            setActive(name);
            history?.push("/repos");
        }else if(name === 'Sbom'){
            setActive(name);
            history?.push("/sbom");
        }else if(name === 'Vulnerabilities'){
            setActive(name);
            history?.push("/vulnerabilities");
        }else if(name === 'History'){
            setActive(name);
            history?.push("/repohistory");
        }else if(name === 'WEB3'){
            setActive(name);
            history?.push("/blockchain");
        }else if(name === 'Container Scan'){
            setActive(name);
            history?.push("/containerscan");
        }else if(name === 'Binary Image Scan'){
            setActive(name);
            history?.push("/binaryimagescan");
        }
    }
    
    return (
            <Menu size="large" stackable borderless>
                <Menu.Item>
                    <a  href='/dashboard'>
                    {/* <Image src={logo} width='60px'/> */}
                    </a>
                </Menu.Item>
                
                {/*<Menu.Item
                name='Home'
                onClick={handleItemClick}
                active={active === 'Home'}
                /> */}
                <Menu.Item
                name='Dashboard'
                onClick={handleItemClick}
                active={active === 'Dashboard'}
                />
                {/* <Menu.Item
                name='History'
                onClick={handleItemClick}
                /> */}
                <Menu.Item
                name='WEB3'
                onClick={handleItemClick}
                active={active === 'WEB3'}
                />
                <Menu.Item 
                name='Container Scan'
                onClick={handleItemClick}
                active={active === 'Container Scan'}
                />
                <Menu.Item 
                name='Binary Image Scan'
                onClick={handleItemClick}
                active={active === 'Binary Image Scan'}
                />
            </Menu>
    )
}
export default NavBar;