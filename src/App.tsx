import React from 'react';
import './App.css';
import Ethereum from "./Ethereum";

function App() {

    // @ts-ignore
    if(window?.ethereum) {
        // @ts-ignore
        console.log('В окне браузера найден объект ethereum:', window?.ethereum)
    }

    return (
        <div className="App">
            {
                // @ts-ignore
                !window?.ethereum?.isMetaMask &&
                <div>
                    Чтобы работать с приложением, пожалуйста установите дополнение
                    &nbsp;
                    <a href="https://metamask.io/" target='_blank' rel="noreferrer">MetaMask</a>.
                </div>
            }

            {
                window?.ethereum?.isMetaMask &&
                <Ethereum/>
            }

        </div>
    );
}

export default App;
