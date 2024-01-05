import { packageOptions } from './constants';
import { ceilN, sum } from './general';


// *******************
// **** CONSTANTS ****
// *******************

const VOLUME_RATIO_METER_TO_CM = 1000000
const DEFAULT_PALLET_WIDTH = 120 // cm
const DEFAULT_PALLET_DEPTH = 80 // cm
const DEFAULT_PALLET_HEIGHT = 15 // cm
const DEFAULT_PALLET_WEIGHT = 20 // kg

const DEFAULT_EMPTY_SPACE = 0.4 // % of space not used
const DEFAULT_USABLE_SPACE = 1 - DEFAULT_EMPTY_SPACE // // % of space used

const DEFAULT_PALLET_AREA = DEFAULT_PALLET_WIDTH * DEFAULT_PALLET_DEPTH * DEFAULT_USABLE_SPACE// cm^2

const EXCLUDED_CABINETS = [
    'BT-PPE-PEW3',
    'BT-PPE-PEW4',
]



// *******************
// **** FUNCTIONS ****
// *******************


function calculateWeight(items) {
    /**
     * calcualte the total weight of the items passed in
     */
    let weights = items.map(item => (item.weight * item.quantity))
    let totalWeight = weights.reduce((a, b) => a + b, 0)
    return totalWeight
}


function seperateCabinets(items) {
    /**
     * takes all items and returns 2 arrays, seperating cabinet items from the remaining items
     */
    let cabinets = [];
    let remainingItems = [];

    items.forEach(item => {
        let isCabinet = (item.productGroup === 'Cabinets')
        let isExcluded = EXCLUDED_CABINETS.includes(item.productCode)

        if (isCabinet && !isExcluded) {
            cabinets.push(item)
        } else {
            remainingItems.push(item)
        }
    })

    return [cabinets, remainingItems]
}


function seperateDangerousGoods(items) {
    /**
     * takes all items and returns 2 arrays, seperating dangerous goods items from the remaining items
     */
    let dangerousGoods = [];
    let remainingItems = [];

    items.forEach(item => {
        let isDangerousGood = (item.productGroup === 'Batteries - Lithium')
        
        if (isDangerousGood) {
            dangerousGoods.push(item)
        } else {
            remainingItems.push(item)
        }
    })

    return [dangerousGoods, remainingItems]
}


function calculateCabinetPallet(cabinet) {
    /** 
     * calculate an estimated pallet for a cabinet 
     */

    console.log("calculateCabinetPallet")
    console.log({cabinet})
    
    let dimensions = [
        cabinet.width,
        cabinet.depth,  
        cabinet.height
    ]

    return {
        quantity: 1,
        name: 'Pallet',
        width: DEFAULT_PALLET_WIDTH,
        depth: DEFAULT_PALLET_DEPTH,
        height: DEFAULT_PALLET_HEIGHT + Math.max(...dimensions),
        weight: DEFAULT_PALLET_WEIGHT + cabinet.weight,
        type: 'Pallet',
        isDG: false,
        dgWeight: 0,
    }
}


function calculateVolume(items) {
    /**
     * return the total cubic volume for all items
     */

    let totalVolume = 0;
    // let totalWeight = 0;

    items.forEach(item => {
        let volume = item.width * item.depth * item.height * item.quantity
        totalVolume+=volume
    })

    return totalVolume
}





function maxDimensions(items) {
    let xVals = [];
    let yVals = [];
    let zVals = [];
    
    let dimensions = items.map(item => [ item.x, item.y, item.z ].sort())
    dimensions.forEach(d => {
        xVals.push(d[0])
        yVals.push(d[1])
        zVals.push(d[2])
    })
    
    let x = Math.max(...xVals)
    let y = Math.max(...yVals)
    return { x, y }
}



// *******************
// ****   LOGIC   ****
// *******************


export function calculatePackages(order) {

    let consignmentItems = [];

    // calculate using items that actually have a quantity
    let items = order.productLines.filter(item => (item.quantity > 0))

    const totalWeight = ceilN(calculateWeight(items), 1)
    const totalVolume = calculateVolume(items)
    const averageWidth = ceilN(Math.cbrt(totalVolume), 5)

    // let dimensions = maxDimensions(items)
    // // validate satches against largest x,y dimensions of items
    let satchel1 = { ...packageOptions['Satchel 1kg'] }
    let satchel3 = { ...packageOptions['Satchel 3kg'] }
    let satchel5 = { ...packageOptions['Satchel 5kg'] }
    // const satchel1Dimensions = [ satchel1.width, satchel1.depth, satchel1.height ].sort().reverse()
    // const satchel1Valid = (((satchel1Dimensions[0]>dimensions.x)||(satchel1Dimensions[1]>dimensions.y)) && (totalWeight <= 1))
    // console.log({satchel1Dimensions})
    // console.log({satchel1Valid})
    // const satchel3Dimensions = [ satchel3.width, satchel3.depth, satchel3.height ].sort().reverse()
    // const satchel3Valid = (((satchel3Dimensions[0]>dimensions.x)||(satchel3Dimensions[1]>dimensions.y)) && (totalWeight <= 3))
    // console.log({satchel3Dimensions})
    // console.log({satchel3Valid})
    // const satchel5Dimensions = [ satchel5.width, satchel5.depth, satchel5.height ].sort().reverse()
    // const satchel5Valid = (((satchel5Dimensions[0]>dimensions.x)||(satchel5Dimensions[1]>dimensions.y)) && (totalWeight <= 5))
    // console.log({satchel5Dimensions})
    // console.log({satchel5Valid})


    if (totalWeight <= 1)  {
        // 1kg satchel
        // TODO: Validate it will fit in satchel
        consignmentItems.push(satchel1)

    } else if (totalWeight <= 3) {
        // 3kg satchel
        // TODO: Validate it will fit in satchel 
        consignmentItems.push(satchel3)

    } else if (totalWeight <= 5) {
        // 5kg satchel
        // TODO: Validate it will fit in satchel 
        consignmentItems.push(satchel5)

    } else if (totalWeight < 35) {
        // calculate cartons
        // TODO: Validate it does not exceed maximum dimensions (eg: solar panel)
        
        let [ dangerousGoods, _ ] = seperateDangerousGoods(items)
        let dangerousGoodsWeight = calculateWeight(dangerousGoods)

        consignmentItems.push({
            quantity: 1,
            name: 'Carton',
            width: averageWidth,
            depth: averageWidth,
            height: averageWidth,
            weight: totalWeight,
            type: 'Carton',
            isDG: Boolean(dangerousGoods.length),
            dgWeight: dangerousGoodsWeight
        })

        // ...
        // ...
        // ...
        // ...
        // ...

    } else {
        // calculate pallets
        
        let [ cabinets, remainingItems1 ] = seperateCabinets(items)
        let [ dangerousGoods, remainingItems2 ] = seperateDangerousGoods(remainingItems1)


        cabinets.forEach(cabinet => {
            let pallet = calculateCabinetPallet(cabinet)
            consignmentItems.push(pallet)
        })

        let remainingVolume = calculateVolume(remainingItems2)
        let remainingWeight = calculateWeight(remainingItems2)
        
        let dangerousGoodsVolume = calculateVolume(dangerousGoods)
        let dangerousGoodsWeight = calculateWeight(dangerousGoods)
        
        let totalRemainingVolume = dangerousGoodsVolume + remainingVolume

        let palletHeight = ceilN((DEFAULT_PALLET_HEIGHT + (totalRemainingVolume / DEFAULT_PALLET_AREA)), 5) // ... this should return height in cm
        
        
        console.log({remainingItems2})
        console.log({remainingWeight})
        console.log({remainingVolume})
        console.log({DEFAULT_PALLET_AREA})
        
        // TODO: cap pallet height before adding to new consignmentItem
        console.log({palletHeight})

        consignmentItems.push({
            quantity: 1,
            name: 'Pallet',
            width: DEFAULT_PALLET_WIDTH,
            depth: DEFAULT_PALLET_DEPTH,
            height: palletHeight,
            weight: ceilN((DEFAULT_PALLET_WEIGHT + remainingWeight + dangerousGoodsWeight), 5),
            type: 'Pallet',
            isDG: Boolean(dangerousGoods.length),
            dgWeight: dangerousGoodsWeight
        })
    }

    consignmentItems.forEach((item, index) => {
        console.log(index, item)
    })

    return consignmentItems;

}



