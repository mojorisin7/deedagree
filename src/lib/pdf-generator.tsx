import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import type { DeedWithRelations } from '@/types'
import { formatCurrency, formatDate, formatGoverningLaw, formatGuaranteeType } from './formatting'

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    color: '#1a1a2e',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 3,
  },
  coverSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    color: '#444',
  },
  coverBox: {
    borderWidth: 1,
    borderColor: '#1a237e',
    padding: 24,
    width: '80%',
    marginTop: 40,
  },
  coverRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  coverLabel: {
    width: '40%',
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  coverValue: {
    width: '60%',
    fontSize: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1a237e',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paragraph: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '35%',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  value: {
    width: '65%',
    fontSize: 9,
  },
  executionBlock: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 20,
    marginBottom: 24,
    breakInside: 'avoid',
  },
  executionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  signatureBox: {
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    marginBottom: 8,
    marginTop: 8,
  },
  signatureImage: {
    height: 70,
    objectFit: 'contain',
    objectPosition: 'left bottom',
  },
  witnessSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#888',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 6,
  },
  numberedClause: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  clauseNumber: {
    width: 30,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  clauseText: {
    flex: 1,
    textAlign: 'justify',
  },
})

function Footer({ reference }: { reference: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Deed of Guarantee — {reference}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}

function DeedPdfDocument({ deed }: { deed: DeedWithRelations }) {
  const signedGuarantors = deed.guarantors.filter((g) => g.signatureStatus === 'SIGNED')
  const allGuarantors = deed.guarantors.sort((a, b) => a.sortOrder - b.sortOrder)

  const governingLawText = formatGoverningLaw(deed.governingLaw)
  const courtJurisdiction =
    deed.governingLaw === 'SCOTLAND'
      ? 'the courts of Scotland'
      : deed.governingLaw === 'NORTHERN_IRELAND'
      ? 'the courts of Northern Ireland'
      : 'the courts of England and Wales'

  return (
    <Document title={`Deed of Guarantee — ${deed.reference}`} author="Deed of Guarantee System">
      {/* Page 1: Cover */}
      <Page size="A4" style={styles.page}>
        <Footer reference={deed.reference} />
        <View style={styles.coverPage}>
          <Text style={styles.coverTitle}>DEED OF GUARANTEE</Text>
          <Text style={styles.coverSubtitle}>
            Personal Guarantee in respect of Mortgage Obligations
          </Text>
          <View style={styles.coverBox}>
            <View style={styles.coverRow}>
              <Text style={styles.coverLabel}>Deed Reference:</Text>
              <Text style={[styles.coverValue, styles.bold]}>{deed.reference}</Text>
            </View>
            <View style={styles.coverRow}>
              <Text style={styles.coverLabel}>Date:</Text>
              <Text style={styles.coverValue}>{formatDate(deed.executionDate ?? deed.createdAt)}</Text>
            </View>
            <View style={styles.coverRow}>
              <Text style={styles.coverLabel}>Borrower:</Text>
              <Text style={styles.coverValue}>{deed.companyName}</Text>
            </View>
            <View style={styles.coverRow}>
              <Text style={styles.coverLabel}>Lender:</Text>
              <Text style={styles.coverValue}>{deed.lender}</Text>
            </View>
            <View style={styles.coverRow}>
              <Text style={styles.coverLabel}>Property:</Text>
              <Text style={styles.coverValue}>{deed.propertyAddress}</Text>
            </View>
            <View style={styles.coverRow}>
              <Text style={styles.coverLabel}>Mortgage Amount:</Text>
              <Text style={[styles.coverValue, styles.bold]}>{formatCurrency(deed.mortgageAmount)}</Text>
            </View>
            <View style={styles.coverRow}>
              <Text style={styles.coverLabel}>Guarantors:</Text>
              <Text style={styles.coverValue}>
                {allGuarantors.map((g) => g.fullName).join(', ')}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Page 2+: Deed Body */}
      <Page size="A4" style={styles.page}>
        <Footer reference={deed.reference} />

        {/* Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties</Text>
          <Text style={styles.paragraph}>
            THIS DEED OF GUARANTEE is made on {formatDate(deed.executionDate ?? deed.createdAt)}.
          </Text>

          <Text style={[styles.bold, { marginBottom: 4 }]}>THE BORROWER:</Text>
          <View style={{ marginLeft: 20, marginBottom: 12 }}>
            <View style={styles.row}><Text style={styles.label}>Company Name:</Text><Text style={styles.value}>{deed.companyName}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Reg. Number:</Text><Text style={styles.value}>{deed.companyRegNumber}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Address:</Text><Text style={styles.value}>{deed.companyAddress}</Text></View>
          </View>

          <Text style={[styles.bold, { marginBottom: 4 }]}>THE LENDER:</Text>
          <View style={{ marginLeft: 20, marginBottom: 12 }}>
            <Text style={styles.paragraph}>{deed.lender}{deed.lenderAddress ? `\n${deed.lenderAddress}` : ''}</Text>
          </View>

          <Text style={[styles.bold, { marginBottom: 4 }]}>THE GUARANTOR(S):</Text>
          {allGuarantors.map((g, i) => (
            <View key={g.id} style={{ marginLeft: 20, marginBottom: 8 }}>
              <Text style={styles.bold}>{i + 1}. {g.fullName}</Text>
              {g.address && <Text style={{ fontSize: 9, color: '#555' }}>{g.address}</Text>}
              {g.email && <Text style={{ fontSize: 9, color: '#555' }}>{g.email}</Text>}
            </View>
          ))}
        </View>

        {/* Recitals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recitals</Text>
          <View style={styles.numberedClause}>
            <Text style={styles.clauseNumber}>(A)</Text>
            <Text style={styles.clauseText}>
              The Borrower, {deed.companyName} (Company Registration Number {deed.companyRegNumber}), has entered into or proposes to enter into a mortgage with the Lender, {deed.lender}, in the sum of {formatCurrency(deed.mortgageAmount)} secured on the property situate at {deed.propertyAddress} (the "Property").
            </Text>
          </View>
          <View style={styles.numberedClause}>
            <Text style={styles.clauseNumber}>(B)</Text>
            <Text style={styles.clauseText}>
              The Lender has required, as a condition of advancing or continuing to advance the said sum, that the Guarantor(s) provide a personal guarantee of the obligations of the Borrower under the said mortgage.
            </Text>
          </View>
          <View style={styles.numberedClause}>
            <Text style={styles.clauseNumber}>(C)</Text>
            <Text style={styles.clauseText}>
              The Guarantor(s) have agreed to enter into this Deed of Guarantee in favour of the Lender on the terms set out herein.
            </Text>
          </View>
        </View>

        {/* Operative Clauses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operative Provisions</Text>

          <View style={styles.numberedClause}>
            <Text style={styles.clauseNumber}>1.</Text>
            <Text style={[styles.clauseText, styles.bold]}>DEFINITIONS</Text>
          </View>
          <View style={{ marginLeft: 30, marginBottom: 8 }}>
            <Text style={styles.paragraph}>"Guaranteed Obligations" means all present and future obligations and liabilities of the Borrower to the Lender under or in connection with the mortgage of the Property, including{deed.includesInterest ? ' interest,' : ''}{deed.includesCosts ? ' costs, charges and expenses,' : ''} whether actual or contingent.</Text>
          </View>

          <View style={styles.numberedClause}>
            <Text style={styles.clauseNumber}>2.</Text>
            <Text style={[styles.clauseText, styles.bold]}>GUARANTEE AND INDEMNITY</Text>
          </View>
          <View style={{ marginLeft: 30, marginBottom: 8 }}>
            <Text style={styles.paragraph}>
              In consideration of the Lender advancing or agreeing to advance monies to the Borrower, the Guarantor(s) hereby unconditionally and irrevocably guarantee{deed.guarantors.length > 1 ? ', jointly and severally,' : ''} to the Lender the due and punctual payment and discharge of all Guaranteed Obligations.
            </Text>
            {deed.guaranteeType === 'LIMITED' && deed.limitedAmount && (
              <Text style={styles.paragraph}>
                The maximum aggregate liability of the Guarantor(s) under this Deed shall not exceed {formatCurrency(deed.limitedAmount)}.
              </Text>
            )}
          </View>

          <View style={styles.numberedClause}>
            <Text style={styles.clauseNumber}>3.</Text>
            <Text style={[styles.clauseText, styles.bold]}>SCOPE OF GUARANTEE</Text>
          </View>
          <View style={{ marginLeft: 30, marginBottom: 8 }}>
            <Text style={styles.paragraph}>
              This guarantee extends to: (a) the principal amount of the mortgage; {deed.includesInterest ? '(b) all interest accrued or accruing thereon; ' : ''}{deed.includesCosts ? `${deed.includesInterest ? '(c)' : '(b)'} all costs, charges, fees and expenses incurred by the Lender in connection with the enforcement of this Deed or the recovery of any sums due; ` : ''}and all other Guaranteed Obligations.
            </Text>
          </View>

          {deed.jointAndSeveral && deed.guarantors.length > 1 && (
            <>
              <View style={styles.numberedClause}>
                <Text style={styles.clauseNumber}>4.</Text>
                <Text style={[styles.clauseText, styles.bold]}>JOINT AND SEVERAL LIABILITY</Text>
              </View>
              <View style={{ marginLeft: 30, marginBottom: 8 }}>
                <Text style={styles.paragraph}>
                  The obligations of each Guarantor under this Deed are joint and several. The Lender may enforce its rights against any one or more of the Guarantors without first proceeding against any other Guarantor or the Borrower, and without exhausting any other remedy or security.
                </Text>
              </View>
            </>
          )}

          <View style={styles.numberedClause}>
            <Text style={styles.clauseNumber}>{deed.jointAndSeveral && deed.guarantors.length > 1 ? '5' : '4'}.</Text>
            <Text style={[styles.clauseText, styles.bold]}>PRESERVATION OF RIGHTS</Text>
          </View>
          <View style={{ marginLeft: 30, marginBottom: 8 }}>
            <Text style={styles.paragraph}>
              The liability of the Guarantor(s) under this Deed shall not be discharged, impaired or otherwise affected by reason of: (a) any variation, extension, discharge, compromise, dealing with, exchange or renewal of any right or remedy of the Lender against the Borrower; (b) any amendment or supplement to the mortgage or any other document; (c) the granting of any time, forbearance, indulgence or concession to the Borrower; or (d) any other act, event or omission which, but for this provision, might operate to discharge, impair or otherwise affect the obligations of the Guarantor(s).
            </Text>
          </View>

          <View style={styles.numberedClause}>
            <Text style={styles.clauseNumber}>{deed.jointAndSeveral && deed.guarantors.length > 1 ? '6' : '5'}.</Text>
            <Text style={[styles.clauseText, styles.bold]}>DEMAND</Text>
          </View>
          <View style={{ marginLeft: 30, marginBottom: 8 }}>
            <Text style={styles.paragraph}>
              The Lender may make demand under this Deed at any time and from time to time. A written demand served on any Guarantor at the address shown in this Deed shall constitute valid service.
            </Text>
          </View>

          {deed.requiresILA && (
            <>
              <View style={styles.numberedClause}>
                <Text style={styles.clauseNumber}>{deed.jointAndSeveral && deed.guarantors.length > 1 ? '7' : '6'}.</Text>
                <Text style={[styles.clauseText, styles.bold]}>INDEPENDENT LEGAL ADVICE</Text>
              </View>
              <View style={{ marginLeft: 30, marginBottom: 8 }}>
                <Text style={styles.paragraph}>
                  Each Guarantor confirms that they have been advised to seek independent legal advice prior to entering into this Deed and that they have had the opportunity to do so.
                </Text>
              </View>
            </>
          )}

          <View style={styles.numberedClause}>
            <Text style={styles.clauseNumber}>{deed.requiresILA ? (deed.jointAndSeveral && deed.guarantors.length > 1 ? '8' : '7') : (deed.jointAndSeveral && deed.guarantors.length > 1 ? '7' : '6')}.</Text>
            <Text style={[styles.clauseText, styles.bold]}>GOVERNING LAW</Text>
          </View>
          <View style={{ marginLeft: 30, marginBottom: 8 }}>
            <Text style={styles.paragraph}>
              This Deed shall be governed by and construed in accordance with the law of {governingLawText} and each party irrevocably submits to the exclusive jurisdiction of {courtJurisdiction}.
            </Text>
          </View>

          {deed.specialConditions && (
            <>
              <View style={styles.numberedClause}>
                <Text style={styles.clauseNumber}>SC.</Text>
                <Text style={[styles.clauseText, styles.bold]}>SPECIAL CONDITIONS</Text>
              </View>
              <View style={{ marginLeft: 30, marginBottom: 8 }}>
                <Text style={styles.paragraph}>{deed.specialConditions}</Text>
              </View>
            </>
          )}
        </View>
      </Page>

      {/* Execution Blocks — one page per guarantor or grouped */}
      <Page size="A4" style={styles.page}>
        <Footer reference={deed.reference} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Execution</Text>
          <Text style={[styles.paragraph, { marginBottom: 20 }]}>
            IN WITNESS WHEREOF this Deed has been executed as a deed by the Guarantor(s) on the date(s) shown below.
          </Text>

          {allGuarantors.map((g) => (
            <View key={g.id} style={styles.executionBlock}>
              <Text style={styles.executionTitle}>
                SIGNED AS A DEED BY {g.fullName.toUpperCase()}
              </Text>

              <View style={styles.row}>
                <Text style={styles.label}>Full Name:</Text>
                <Text style={styles.value}>{g.fullName}</Text>
              </View>
              {g.address && (
                <View style={styles.row}>
                  <Text style={styles.label}>Address:</Text>
                  <Text style={styles.value}>{g.address}</Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Date Signed:</Text>
                <Text style={styles.value}>
                  {g.signedAt ? formatDate(g.signedAt) : '________________________'}
                </Text>
              </View>

              <Text style={[styles.bold, { marginTop: 12, marginBottom: 4, fontSize: 9 }]}>Signature:</Text>
              <View style={styles.signatureBox}>
                {g.signatureData ? (
                  <Image src={g.signatureData} style={styles.signatureImage} />
                ) : (
                  <Text style={{ color: '#ccc', fontSize: 9, marginTop: 20 }}>Awaiting signature</Text>
                )}
              </View>

              <View style={styles.witnessSection}>
                <Text style={[styles.bold, { fontSize: 9, marginBottom: 8 }]}>IN THE PRESENCE OF (WITNESS):</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Witness Name:</Text>
                  <Text style={styles.value}>{g.witnessName ?? '________________________'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Witness Address:</Text>
                  <Text style={styles.value}>{g.witnessAddress ?? '________________________'}</Text>
                </View>
                <Text style={[styles.bold, { marginTop: 8, marginBottom: 4, fontSize: 9 }]}>Witness Signature:</Text>
                <View style={styles.signatureBox}>
                  {g.witnessSignature ? (
                    <Image src={g.witnessSignature} style={styles.signatureImage} />
                  ) : (
                    <Text style={{ color: '#ccc', fontSize: 9, marginTop: 20 }}>Awaiting witness signature</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

export async function generateDeedPdf(deed: DeedWithRelations): Promise<Buffer> {
  const buffer = await renderToBuffer(<DeedPdfDocument deed={deed} />)
  return Buffer.from(buffer)
}
