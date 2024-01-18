
export const createQuoteEmailBody = (details, consignmentItems) => {

    const { companyName, deliveryStreetAddress, deliverySuburb, deliveryState, deliveryPostCode } = details

    const senderDetails = [
        'DPA SOLAR',
        '4/273 WILLIAMSTOWN RD',
        'PORT MELBOURNE VIC 3207'
    ].join('\n')

    const deliveryDetails = [
        companyName,
        deliveryStreetAddress,
        `${deliverySuburb} ${deliveryState} ${deliveryPostCode}`
    ].join('\n')

    const itemsSection = consignmentItems.map(item => {
        /*  1x Pallet
            120cm x 80cm x 160cm - 200kg
            DG: UN 3480, 120kg, packing group: 2 */
        let { quantity, width, depth, height, weight, type, isDG, dgWeight } = item;
        let line1 = `${quantity}x ${type}`
        let line2 = `${width}cm x ${depth}cm x ${height}cm - ${weight}kg`
        let line3 = isDG ? `DG: UN 3480, ${dgWeight}kg, packing group: 2` : 'DG: No'
        return [line1, line2, line3].join('\n')
    })

    const emailBody = [
        `Hi Team,`,
        `\nCan we please get a quote for the following.`,
        `\nFROM:`,
        `${senderDetails}`,
        `\nTO:`,
        `${deliveryDetails}`,
        `\n${itemsSection.join('\n\n')}`
    ].join('\n')

    return emailBody
}