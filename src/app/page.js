"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import Axios from "axios";
import CanvasGraph from "@/components/canvasGraph";
import { filterByStrikePrice } from "@/helpers/method";

const Home = () => {
  const optionType = [
    { name: "Nifty 50", symbol: "NIFTY" },
    { name: "Bank Nifty", symbol: "BANKNIFTY" },
  ];
  const columnCount = [
    { label: "5 columns", value: 5 },
    { label: "10 columns", value: 10 },
    { label: "15 columns", value: 15 },
    { label: "20 columns", value: 20 },
  ];
  const [opData, setOpData] = useState({ poi: 0, coi: 0, data: [], changedCE: 0, changedPE: 0, oiGraph: { call: [], put: [] }, oiChangedGraph: { call: [], put: [] }, strikePriceAry: [] });
  const [selectedOpType, setSelectedOpType] = useState("NIFTY");
  const [columnNumber, setColumnNumber] = useState(5)

  useEffect(() => {
    fetchNseData(selectedOpType);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNseData(selectedOpType);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedOpType]);

  const fetchNseData = (symbol = "NIFTY", columnCount = 5) => {
    Axios.get(`/api/nse?symbol=${symbol}`)
      .then((rsp) => {
        const res = rsp.data;
        if (res.isSuccess) {
          const data = res.data.filtered.data;
          const PE = res.data.filtered.PE.totOI;
          const CE = res.data.filtered.CE.totOI;
          let changedPE = 0;
          let changedCE = 0;
          const callOiAry = []
          const putOiAry = []
          const callOiChangedAry = []
          const putOiChangedAry = []
          let currentStrikePrice = ""
          data.map((item) => {
            if (!currentStrikePrice) {
              currentStrikePrice = item.CE.underlyingValue
            }
            changedCE += item.CE.changeinOpenInterest;
            changedPE += item.PE.changeinOpenInterest;

            callOiAry.push({ label: item.CE.strikePrice, y: item.CE.openInterest })
            putOiAry.push({ label: item.PE.strikePrice, y: item.PE.openInterest })
            callOiChangedAry.push({ label: item.CE.strikePrice, y: item.CE.changeinOpenInterest })
            putOiChangedAry.push({ label: item.PE.strikePrice, y: item.PE.changeinOpenInterest })
          });

          const formattedCallOiAry = filterByStrikePrice(callOiAry, currentStrikePrice, columnCount);
          const formattedPutOiAry = filterByStrikePrice(putOiAry, currentStrikePrice, columnCount);
          const formattedCallChangedOiAry = filterByStrikePrice(callOiChangedAry, currentStrikePrice, columnCount);
          const formattedPutChangedOiAry = filterByStrikePrice(putOiChangedAry, currentStrikePrice, columnCount);
          const strikePriceAry = []
          for (let i = 1; i <= (columnCount * 2) + 1; i++) {
            if (i == columnCount + 1) {
              strikePriceAry.push({ label: "", y: currentStrikePrice })
            } else {
              strikePriceAry.push({ label: "", y: "" })
            }
          }
          setOpData({ poi: PE, coi: CE, data, changedCE, changedPE, oiGraph: { call: formattedCallOiAry, put: formattedPutOiAry }, oiChangedGraph: { call: formattedCallChangedOiAry, put: formattedPutChangedOiAry }, strikePriceAry });
        }
      }).catch((err) => {
        console.log("Error is ", err);
      });
  };

  const putCallRation = (opData?.poi / opData?.coi).toFixed(2);
  const changedPutCallRation = (opData?.changedPE / opData?.changedCE).toFixed(
    2
  );
  const downtrend =
    putCallRation > 1.7 || (putCallRation >= 0.7 && putCallRation <= 1);
  const uptrend =
    putCallRation < 0.7 || (putCallRation >= 1 && putCallRation <= 1.7);

  return (
    <div className={styles["home-container"]}>
      {opData.data.length ? (
        <>
          <div className={styles["calc-container"]}>
            <div className={styles["oi-container"]}>
              <div className={styles["putOI"]}>Total Put OI:- {opData.poi}</div>
              <div className={styles["callOI"]}>
                Total Call OI:- {opData.coi}
              </div>
              <div className={styles["callPutRatio"]}>
                Put Call Ration:- {putCallRation}
              </div>
              <div className={styles["trend"]}>
                Trend Chance:-
                <label className={`${downtrend && styles["down"]} ${uptrend && styles["up"]}`}>
                  {downtrend ? "Down" : uptrend ? "Up" : ""}
                </label>
              </div>
            </div>
            <div>
              <select
                className={styles["optionType"]}
                onChange={(e) => {
                  fetchNseData(e.target.value, columnNumber);
                  setSelectedOpType(e.target.value);
                }}
              >
                {optionType.map((item) => {
                  return (
                    <option key={item.symbol} value={item.symbol}>
                      {item.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={styles["changedOi-container"]}>
              <div className={styles["putOI"]}>
                Total Put OI Changed:- {opData.changedPE}
              </div>
              <div className={styles["callOI"]}>
                Total Call OI Changed:- {opData.changedCE}
              </div>
              <div className={styles["callPutRatio"]}>
                Put Call Ration:- {changedPutCallRation}
              </div>
              <div className={styles["trend"]}>
                Trend Chance:-
                <label
                  className={`${changedPutCallRation < 1 && styles["down"]} ${changedPutCallRation > 1 && styles["up"]
                    }`}
                >
                  {changedPutCallRation < 1
                    ? "Down"
                    : changedPutCallRation > 1
                      ? "Up"
                      : ""}
                </label>
              </div>
            </div>
          </div>
          <table border={1} className={styles["table-container"]}>
            <thead className={styles["header"]}>
              <tr className={styles["no-border"]}>
                <th colSpan={3}>Call</th>
                <th></th>
                <th colSpan={3}>Put</th>
              </tr>
              <tr>
                <th>OI</th>
                <th>Changed in OI</th>
                <th>Price</th>
                <th>Strike Price</th>
                <th>Price</th>
                <th>Changed in OI</th>
                <th>OI</th>
              </tr>
            </thead>
            <tbody className={styles["body"]}>
              {opData.data.map((item, ind) => {
                const callInTheMoney = item.CE.underlyingValue > item.CE.strikePrice
                const putInTheMoney = item.CE.underlyingValue < item.CE.strikePrice
                if (item.CE.strikePrice > item.CE.underlyingValue && item.CE.underlyingValue > item.CE.strikePrice - 50) {
                  return (
                    <>
                      <tr key={`option-strike`} className={styles["atTheMoney"]}>
                        <td colSpan={7}>{item.CE.underlyingValue}</td>
                      </tr>
                      <tr key={`option ${ind}`}>
                        <td className={`${callInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]}`}>{item.CE.openInterest}</td>
                        <td className={`${callInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]} ${item.CE.changeinOpenInterest < 0 ? styles["danger"] : ""}`}>{item.CE.changeinOpenInterest}</td>
                        <td className={`${callInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]}`}>{item.CE.askPrice}</td>
                        <td className={styles["strikPrice"]}>{item.CE.strikePrice}</td>
                        <td className={`${putInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]}`}>{item.PE.askPrice}</td>
                        <td className={`${putInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]} ${item.PE.changeinOpenInterest < 0 ? styles["danger"] : ""}`}>{item.PE.changeinOpenInterest}</td>
                        <td className={`${putInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]}`}>{item.PE.openInterest}</td>
                      </tr>
                    </>
                  );
                }
                return (
                  <tr key={`option ${ind}`}>
                    <td className={`${callInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]}`}>{item.CE.openInterest}</td>
                    <td className={`${callInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]} ${item.CE.changeinOpenInterest < 0 ? styles["danger"] : ""}`}>{item.CE.changeinOpenInterest}</td>
                    <td className={`${callInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]}`}>{item.CE.askPrice}</td>
                    <td className={styles["strikPrice"]}>{item.CE.strikePrice}</td>
                    <td className={`${putInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]}`}>{item.PE.askPrice}</td>
                    <td className={`${putInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]} ${item.PE.changeinOpenInterest < 0 ? styles["danger"] : ""}`}>{item.PE.changeinOpenInterest}</td>
                    <td className={`${putInTheMoney ? styles["inTheMoney"] : styles["outTheMoney"]}`}>{item.PE.openInterest}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className={styles["columnCount-container"]}>
            <select className={styles["columnCount"]} onChange={(e) => {
              setColumnNumber(Number(e.target.value))
              fetchNseData(selectedOpType, Number(e.target.value))
            }}>
              {
                columnCount.map(item => {
                  return (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  );
                })
              }
            </select>
          </div>
          <CanvasGraph data={opData.oiGraph} strikePriceAry={opData.strikePriceAry} title={"OI"} key={"oiGraph"} />
          <CanvasGraph data={opData.oiChangedGraph} strikePriceAry={opData.strikePriceAry} title={"Changed OI"} key={"changeOiGraph"} />
        </>
      ) : null}
    </div>
  );
};
export default Home;
