import React, { useEffect, useState } from 'react';
import styles from "./index.module.scss";
import Axios from "axios";

const Second = () => {

    const [apiData, setDpiData] = useState({})

    useEffect(() => {
        fetchTradingTickData();
    }, []);

    const fetchTradingTickData = () => {
        // {
        //     "inst": "BANKNIFTY",
        //     "historical": true,
        //     "date": "2023-07-06"
        // }

        // {
        //     "inst": "NIFTY",
        //     "historical": false,
        //     "date": null
        // }
        const data = {
            "inst": "NIFTY",
            "historical": false,
            "date": null
        }
        Axios.post(`/api/tradingTick`, data).then((rsp) => {
            const res = rsp.data
            console.log("checking at line 21 ", res);
        }).catch((err) => {
            console.log("Error is ", err);
        });
    }

    return (
        <div>Second</div>
    )
}

export default Second