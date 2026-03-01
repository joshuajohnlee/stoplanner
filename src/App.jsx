import { Fragment, useEffect, useState } from 'react'
import { parseSeatName } from '../data/constants'

export default function App() {

  const [currentShip, setCurrentShip] = useState("Achilles Miracle Worker Heavy Destroyer")
  const [currentShipData, setCurrentShipData] = useState({})

  useEffect(() => {
    async function getShipInfo() {
      const url = "http://ships.stonewallfleet.com/api.php?name=" + String(currentShip).split(" ").join("%20");
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        setCurrentShipData(result.ships[0])
      } catch (error) {
        console.error(error.message);
      }
    }

    function buildSlotsArray() {
      if (currentShipData === null) {
        return ([]);
      }
      let slotsArray = []
      for (const thisSeat in currentShipData?.bridge_officers) {
        let seatArray = []
        for (let i = 0; i < currentShipData?.bridge_officers[thisSeat]["rank"]; i++) {
          seatArray.push(null)
        }
        slotsArray.push(seatArray)
      }
      return slotsArray;
    }

    getShipInfo()
    buildSlotsArray()
  }, [currentShip, currentShipData])

  function handleShipChange(event) {
    setCurrentShip(event.target.value)
  }

  return (
    <>
      <h1>STO Planner</h1>

      <h2>Current Ship: {currentShip}</h2>

      <input type="text" value={currentShip} onChange={(e) => handleShipChange(e)} />

      <div id="boff-box">
        {currentShipData?.bridge_officers?.map(boff => (
          <Fragment key={boff.id}>
            <div className='seat-name'>{parseSeatName(boff)}</div>
            <div className='seat-abilities'>
              {[...Array(boff.rank)].map((_, index) =>
                <Fragment key={"boff-seat" + index}>
                  <button className='seat-ability-box' data-ability="test" title="Ability Name Here">
                    {index + 1}
                  </button>
                </Fragment>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}
