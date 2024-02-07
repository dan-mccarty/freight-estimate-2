import { packageOptions } from './constants'
import { ceilN, sum, add, multiply } from './general'

// *******************
// **** CONSTANTS ****
// *******************

const VOLUME_RATIO_METER_TO_CM = 1000000
const DEFAULT_PALLET_WIDTH = 120 // cm
const DEFAULT_PALLET_DEPTH = 80 // cm
const DEFAULT_PALLET_HEIGHT = 15 // cm
const DEFAULT_PALLET_WEIGHT = 20 // kg

const MAX_PALLET_HEIGHT = 160 // cm

const DEFAULT_EMPTY_SPACE = 0.4 // % of space not used
const DEFAULT_USABLE_SPACE = 1 - DEFAULT_EMPTY_SPACE // // % of space used

const DEFAULT_PALLET_AREA =
  DEFAULT_PALLET_WIDTH * DEFAULT_PALLET_DEPTH * DEFAULT_USABLE_SPACE // cm^2

const EXCLUDED_CABINETS = ['BT-PPE-PEW3', 'BT-PPE-PEW4']

// *******************
// **** FUNCTIONS ****
// *******************

function calculateWeight(items) {
  /**
   * calcualte the total weight of the items passed in
   */
  let weights = items.map((item) => item.weight * item.quantity)
  let totalWeight = weights.reduce((a, b) => a + b, 0)
  return totalWeight
}

function calculateWeight2(items) {
  /**
   * calcualte the total weight of the items passed in
   */

  return items.map(({ weight, quantity }) => weight * quantity).reduce(add, 0)
}

function seperateCabinets(items) {
  /**
   * takes all items and returns 2 arrays, seperating cabinet items from the remaining items
   */
  let cabinets = []
  let remainingItems = []

  items.forEach((item) => {
    let isCabinet = item.productGroup === 'Cabinets'
    let isExcluded = EXCLUDED_CABINETS.includes(item.productCode)

    if (isCabinet && !isExcluded) {
      cabinets.push(item)
    } else {
      remainingItems.push(item)
    }
  })

  return [cabinets, remainingItems]
}

function seperateCabinets2(items) {
  /**
   * takes all items and returns 2 arrays, seperating cabinet items from the remaining items
   */
  return [
    items.filter(
      ({ productGroup, productCode }) =>
        productGroup === 'Cabinets' && !EXCLUDED_CABINETS.includes(productCode),
    ),
    items.filter(
      ({ productGroup, productCode }) =>
        productGroup !== 'Cabinets' || EXCLUDED_CABINETS.includes(productCode),
    ),
  ]
}

function seperateDangerousGoods(items) {
  /**
   * takes all items and returns 2 arrays, seperating dangerous goods items from the remaining items
   */
  let dangerousGoods = []
  let remainingItems = []

  items.forEach((item) => {
    let isDangerousGood = item.productGroup === 'Batteries - Lithium'

    if (isDangerousGood) {
      dangerousGoods.push(item)
    } else {
      remainingItems.push(item)
    }
  })

  return [dangerousGoods, remainingItems]
}

function seperateDangerousGoods2(items) {
  /**
   * takes all items and returns 2 arrays, seperating dangerous goods items from the remaining items
   */
  return [
    items.filter((item) => item.productGroup === 'Batteries - Lithium'),
    items.filter((item) => item.productGroup !== 'Batteries - Lithium'),
  ]
}

function calculateCabinetPallet(cabinet) {
  /**
   * calculate an estimated pallet for a cabinet
   */

  console.log('calculateCabinetPallet')
  console.log({ cabinet })

  const dimensions = [width, cabinet.depth, cabinet.height]

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

  let totalVolume = 0
  // let totalWeight = 0;

  items.forEach((item) => {
    let volume = item.width * item.depth * item.height * item.quantity
    totalVolume += volume
  })

  return totalVolume
}

function calculateVolume2(items) {
  /**
   * return the total cubic volume for all items
   */

  return items
    .map(({ width, depth, height, quantity }) => multiply(width, depth, height, quantity))
    .reduce(sum)
}

function groupItems(items) {
  const [cabinets, remainingItems1] = seperateCabinets(items)
  const [dangerousGoods, remainingItems2] = seperateDangerousGoods(remainingItems1)

  return {
    cabinets: cabinets,
    dangerousGoods: dangerousGoods,
    items: remainingItems2,
  }
}

// *******************
// ****   LOGIC   ****
// *******************

export function calculatePackages(order) {
  let consignmentItems = []

  // calculate using items that actually have a quantity
  let items = order.productLines.filter((item) => item.quantity > 0)

  const totalWeight = ceilN(calculateWeight(items), 1)
  const totalVolume = calculateVolume(items)
  const averageWidth = ceilN(Math.cbrt(totalVolume), 5)

  // let dimensions = maxDimensions(items)
  // // validate satches against largest x,y dimensions of items
  const satchel1 = { ...packageOptions['Satchel 1kg'] }
  const satchel3 = { ...packageOptions['Satchel 3kg'] }
  const satchel5 = { ...packageOptions['Satchel 5kg'] }

  if (totalWeight <= 1) {
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

    const [dangerousGoods, _] = seperateDangerousGoods(items)
    const dangerousGoodsWeight = calculateWeight(dangerousGoods)

    consignmentItems.push({
      quantity: 1,
      name: 'Carton',
      width: averageWidth,
      depth: averageWidth,
      height: averageWidth,
      weight: totalWeight,
      type: 'Carton',
      isDG: Boolean(dangerousGoods.length),
      dgWeight: dangerousGoodsWeight,
    })

    // ...
    // ...
    // ...
    // ...
    // ...
  } else {
    // calculate pallets

    let [cabinets, remainingItems1] = seperateCabinets(items)
    let [dangerousGoods, remainingItems2] = seperateDangerousGoods(remainingItems1)

    cabinets.forEach((cabinet) => {
      let pallet = calculateCabinetPallet(cabinet)
      consignmentItems.push(pallet)
    })

    let remainingVolume = calculateVolume(remainingItems2)
    let remainingWeight = calculateWeight(remainingItems2)

    let dangerousGoodsVolume = calculateVolume(dangerousGoods)
    let dangerousGoodsWeight = calculateWeight(dangerousGoods)

    let totalRemainingVolume = dangerousGoodsVolume + remainingVolume

    let totalHeight = ceilN(
      DEFAULT_PALLET_HEIGHT + totalRemainingVolume / DEFAULT_PALLET_AREA,
      5,
    ) // ... this should return height in cm

    console.log({ remainingItems2 })
    console.log({ remainingWeight })
    console.log({ remainingVolume })
    console.log({ DEFAULT_PALLET_AREA })

    // TODO: cap pallet height before adding to new consignmentItem
    let palletQty = totalHeight / MAX_PALLET_HEIGHT

    if (palletQty > 1) {
      const totalWeight = remainingWeight + dangerousGoodsWeight
      const ratioHeightWeight = totalWeight / totalHeight
      const ratioDgWeight = dangerousGoodsWeight / totalHeight

      console.log({ palletQty })
      console.log({ totalHeight })
      console.log({ totalWeight })
      console.log({ ratioHeightWeight })
      console.log({ ratioDgWeight })

      consignmentItems.push({
        quantity: Math.floor(palletQty),
        name: 'Pallet',
        width: DEFAULT_PALLET_WIDTH,
        depth: DEFAULT_PALLET_DEPTH,
        height: MAX_PALLET_HEIGHT,
        weight: ceilN(DEFAULT_PALLET_WEIGHT + MAX_PALLET_HEIGHT * ratioHeightWeight, 5),
        type: 'Pallet',
        isDG: Boolean(dangerousGoods.length),
        dgWeight: MAX_PALLET_HEIGHT * ratioDgWeight,
      })

      const remainingHeight = totalHeight % MAX_PALLET_HEIGHT
      const remainingTotalWeight = remainingHeight * ratioHeightWeight
      const remainingDgWeight = remainingHeight * ratioDgWeight

      console.log({ remainingHeight })
      console.log({ remainingTotalWeight })
      console.log({ remainingDgWeight })

      consignmentItems.push({
        quantity: 1,
        name: 'Pallet',
        width: DEFAULT_PALLET_WIDTH,
        depth: DEFAULT_PALLET_DEPTH,
        height: remainingHeight,
        weight: ceilN(DEFAULT_PALLET_WEIGHT + remainingTotalWeight, 5),
        type: 'Pallet',
        isDG: Boolean(dangerousGoods.length),
        dgWeight: remainingDgWeight,
      })
    } else {
      const palletHeight = totalHeight

      consignmentItems.push({
        quantity: 1,
        name: 'Pallet',
        width: DEFAULT_PALLET_WIDTH,
        depth: DEFAULT_PALLET_DEPTH,
        height: palletHeight,
        weight: ceilN(DEFAULT_PALLET_WEIGHT + remainingWeight + dangerousGoodsWeight, 5),
        type: 'Pallet',
        isDG: Boolean(dangerousGoods.length),
        dgWeight: dangerousGoodsWeight,
      })
    }
  }

  consignmentItems.forEach((item, index) => {
    console.log(index, item)
  })

  return consignmentItems
}

export function calculatePackages2(order) {
  let consignmentItems = []

  // calculate using items that actually have a quantity
  const items = order.productLines.filter((item) => item.quantity > 0)

  const totalWeight = ceilN(calculateWeight(items), 1)
  const totalVolume = calculateVolume(items)
  const averageWidth = ceilN(Math.cbrt(totalVolume), 5)

  // let dimensions = maxDimensions(items)
  // // validate satches against largest x,y dimensions of items
  const satchel1 = { ...packageOptions['Satchel 1kg'] }
  const satchel3 = { ...packageOptions['Satchel 3kg'] }
  const satchel5 = { ...packageOptions['Satchel 5kg'] }

  if (totalWeight <= 1) {
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

    const [dangerousGoods, _] = seperateDangerousGoods(items)
    const dangerousGoodsWeight = calculateWeight(dangerousGoods)

    consignmentItems.push({
      quantity: 1,
      name: 'Carton',
      width: averageWidth,
      depth: averageWidth,
      height: averageWidth,
      weight: totalWeight,
      type: 'Carton',
      isDG: Boolean(dangerousGoods.length),
      dgWeight: dangerousGoodsWeight,
    })

    // ...
    // ...
    // ...
    // ...
    // ...
  } else {
    // calculate pallets

    let [cabinets, remainingItems1] = seperateCabinets(items)
    let [dangerousGoods, remainingItems2] = seperateDangerousGoods(remainingItems1)

    cabinets.forEach((cabinet) => {
      let pallet = calculateCabinetPallet(cabinet)
      consignmentItems.push(pallet)
    })

    let remainingVolume = calculateVolume(remainingItems2)
    let remainingWeight = calculateWeight(remainingItems2)

    let dangerousGoodsVolume = calculateVolume(dangerousGoods)
    let dangerousGoodsWeight = calculateWeight(dangerousGoods)

    let totalRemainingVolume = dangerousGoodsVolume + remainingVolume

    let totalHeight = ceilN(
      DEFAULT_PALLET_HEIGHT + totalRemainingVolume / DEFAULT_PALLET_AREA,
      5,
    ) // ... this should return height in cm

    console.log({ remainingItems2 })
    console.log({ remainingWeight })
    console.log({ remainingVolume })
    console.log({ DEFAULT_PALLET_AREA })

    // TODO: cap pallet height before adding to new consignmentItem
    let palletQty = totalHeight / MAX_PALLET_HEIGHT

    if (palletQty > 1) {
      const totalWeight = remainingWeight + dangerousGoodsWeight
      const ratioHeightWeight = totalWeight / totalHeight
      const ratioDgWeight = dangerousGoodsWeight / totalHeight

      console.log({ palletQty })
      console.log({ totalHeight })
      console.log({ totalWeight })
      console.log({ ratioHeightWeight })
      console.log({ ratioDgWeight })

      consignmentItems.push({
        quantity: Math.floor(palletQty),
        name: 'Pallet',
        width: DEFAULT_PALLET_WIDTH,
        depth: DEFAULT_PALLET_DEPTH,
        height: MAX_PALLET_HEIGHT,
        weight: ceilN(DEFAULT_PALLET_WEIGHT + MAX_PALLET_HEIGHT * ratioHeightWeight, 5),
        type: 'Pallet',
        isDG: Boolean(dangerousGoods.length),
        dgWeight: MAX_PALLET_HEIGHT * ratioDgWeight,
      })

      const remainingHeight = totalHeight % MAX_PALLET_HEIGHT
      const remainingTotalWeight = remainingHeight * ratioHeightWeight
      const remainingDgWeight = remainingHeight * ratioDgWeight

      console.log({ remainingHeight })
      console.log({ remainingTotalWeight })
      console.log({ remainingDgWeight })

      consignmentItems.push({
        quantity: 1,
        name: 'Pallet',
        width: DEFAULT_PALLET_WIDTH,
        depth: DEFAULT_PALLET_DEPTH,
        height: remainingHeight,
        weight: ceilN(DEFAULT_PALLET_WEIGHT + remainingTotalWeight, 5),
        type: 'Pallet',
        isDG: Boolean(dangerousGoods.length),
        dgWeight: remainingDgWeight,
      })
    } else {
      const palletHeight = totalHeight

      consignmentItems.push({
        quantity: 1,
        name: 'Pallet',
        width: DEFAULT_PALLET_WIDTH,
        depth: DEFAULT_PALLET_DEPTH,
        height: palletHeight,
        weight: ceilN(DEFAULT_PALLET_WEIGHT + remainingWeight + dangerousGoodsWeight, 5),
        type: 'Pallet',
        isDG: Boolean(dangerousGoods.length),
        dgWeight: dangerousGoodsWeight,
      })
    }
  }

  consignmentItems.forEach((item, index) => {
    console.log(index, item)
  })

  return consignmentItems
}
