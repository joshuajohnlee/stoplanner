
import { Fragment, useEffect, useState } from 'react'
import { parseSeatName, getIconName } from '../data/constants'
import spaceAbilitiesData from '../data/spaceabilities.json'
import Select from "react-select";
import Modal from 'react-modal'

const spaceAbilities = spaceAbilitiesData.namesonly
const spaceAbilitiesOptions = []

for (const ability in spaceAbilities) {
    spaceAbilitiesOptions.push(
        { value: spaceAbilities[ability], label: spaceAbilities[ability] }
    )
}

export default function Boffs() {
    const [currentShip, setCurrentShip] = useState("Achilles Miracle Worker Heavy Destroyer")
    const [currentShipData, setCurrentShipData] = useState({})
    const [seatAbilities, setSeatAbilities] = useState(JSON.parse(localStorage.getItem("seatAbilities")) || [])
    const [isAbilitySelectorOpen, setIsAbilitySelectorOpen] = useState(false)
    const [abilitySelectorPosition, setAbilitySelectorPosition] = useState(null)
    const [selectedAbility, setSelectedAbility] = useState(null)

    const appElement = document.getElementById('root');

    // When current ship changes, fetch the ship data and build a new array of slots based on the ship's BOFF layout
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
    }, [currentShip])

    // Update seatAbilities when currentShipData changes
    useEffect(() => {
        // Check if we have stored data for this ship
        const storedData = JSON.parse(localStorage.getItem("seatAbilities")) || {};
        if (storedData.currentShip === currentShip && storedData.seatAbilities) {
            setSeatAbilities(storedData.seatAbilities)
        } else {
            // Build fresh array if no stored data for this ship
            if (currentShipData === null || Object.keys(currentShipData).length === 0) {
                setSeatAbilities([])
            } else {
                let slotsArray = []
                for (const thisSeat in currentShipData?.bridge_officers) {
                    let seatArray = []
                    for (let i = 0; i < currentShipData?.bridge_officers[thisSeat]["rank"]; i++) {
                        seatArray.push(null)
                    }
                    slotsArray.push(seatArray)
                }
                setSeatAbilities(slotsArray)
            }
        }
    }, [currentShipData, currentShip])

    useEffect(() => {
        let currentShipAbilities = { [currentShip]: seatAbilities }
        const storedData = JSON.parse(localStorage.getItem("seatAbilities"))
        if (storedData) {
            currentShipAbilities = { ...storedData, ...currentShipAbilities }
        }
        localStorage.setItem("seatAbilities", JSON.stringify(currentShipAbilities))
    }, [seatAbilities, currentShip])

    function handleShipChange(event) {
        setCurrentShip(event.target.value)
    }

    function handleAbilitySelect(selectedOption) {
        setSelectedAbility(selectedOption.value)
        if (abilitySelectorPosition) {
            const { boffIndex, abilityIndex } = abilitySelectorPosition
            setSeatAbilities(prevSeatAbilities => {
                const updatedSeatAbilities = [...prevSeatAbilities];
                updatedSeatAbilities[boffIndex][abilityIndex] = selectedOption.value;
                return updatedSeatAbilities;
            })
        }
        setIsAbilitySelectorOpen(false)
    }

    return (
        <>
            <h1>STO Planner</h1>

            <h2>Current Ship: {currentShip}</h2>

            <input type="text" value={currentShip} onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleShipChange(e)
                }
            }}   />

            <div id="boff-container">
                {currentShipData?.bridge_officers?.map((boff, boffIndex) => (

                    <div className="boff-seat" key={"boff-" + boffIndex}>

                        <div className='seat-name'>{parseSeatName(boff)}</div>

                        <img className='seat-icon' src={"/images/icons/boffs/" + getIconName(boff)} alt={parseSeatName(boff)} />

                        <div className='seat-abilities'>
                            {[...Array(boff.rank)].map((_, seatIndex) =>
                                <Fragment key={"boff-seat" + boffIndex + "-" + seatIndex}>
                                    <div className='seat-ability-box' title="Ability Name Here" onClick={() => {
                                        setIsAbilitySelectorOpen(true)
                                        setAbilitySelectorPosition({ boffIndex: boffIndex, abilityIndex: seatIndex })
                                    }}>
                                        {seatAbilities[boffIndex]?.[seatIndex] ? <img className="ability-icon" src={"/images/icons/abilities/space/" + seatAbilities[boffIndex][seatIndex].toLowerCase().replace(/\s+/g, "_") + ".png"} alt="Ability Icon" /> : <>Empty</>}
                                    </div>
                                </Fragment>
                            )}
                        </div>

                    </div>
                ))}
            </div>

            <Modal
                isOpen={isAbilitySelectorOpen}
                onRequestClose={() => setIsAbilitySelectorOpen(false)}
                shouldCloseOnOverlayClick={true}
                className="ability-selector"
                overlayClassName="ability-selector-overlay"
                appElement={appElement}
            >
                <Select
                    options={spaceAbilitiesOptions}
                    value={selectedAbility}
                    onChange={handleAbilitySelect}
                />
            </Modal>

        </>
    )
}