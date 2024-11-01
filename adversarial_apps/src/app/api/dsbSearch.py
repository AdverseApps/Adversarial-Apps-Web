# Searches the DSBS Database

import requests

# Define the URL where the POST request will be sent
url = 'https://dsbs.sba.gov/search/dsp_profilelist.cfm?RequestTimeout=180'  

# Define the data to be sent in the POST request
data = {
    "CameFromQuickSearch": "No",
    "CameFromSearchHubzone": "No",
    "CameFromSearchTMOnLine": "No",
    "JavaScriptOn": "No",
    "MightNotGetSent": "Agr,Anemp,AnyAllGreen,AnyAllKeywords,AnyAllNaics,Area,AtLeastNoMore,CageCd,Cbona,Cbonc,CBT,Cdist,Cnty,CntyNm,CompanyName,CompanyNameSearch,CompanyUserId,Dbe,Delimiter,Dunses,E8a,E8acase,Edi,Edw,Edwosb,Ein,ExpCountry,ExpMainAct,ExpMrkt,ExportCd,FirmListColumns,FirmListColumnNamesHidden,FontSize,Gcc,Greens,Gsa,HubCert,InTMO,KeyWhere,Keywords,Mntr,Msa,Naicses,NumberOfRows,Password,Phone,PIM,Qas,Report,SaveDBHits,SbaDsn,SbaOffice,SbaSbc,Sbona,Sbonc,Sdb,SearchDB,Seckp,Secst,ShowRandomizer,Sics,Sort,State,Status,Suffix,Technet,Updated,UpdBefAft,UEI,UseOracle,Uscit,UserId,Wob,Wosb,VetSB,VetSerDis,Zip,DispAnyAllComment,DispAnyAllMSIE,DispDisclaimer,DispSectionLocation,DispSectionCertifications,DispSectionOwnership,DispSectionNaicsAndKeywords,DispSectionAreaAndTechnet,DispSectionUpdated,DispSectionBonding,DispSectionQas,DispSectionSize,DispSectionCapabilities,DispSectionSpecificFirm,DispSectionPrivSearch,DispSectionDisplayOptions",
    "PageNames": "dsp_dsbs.cfm,dsp_profilelist.cfm,dsp_profile.cfm",
    "PathNames": "/search,/pro-net/search,/dsbs/search,/dsbs",
    "PIM": "P",
    "SearchDB": "SBA",
    "StartRow": "1",
    "StartTimeOfSearch": "",
    "State": "",
    "Cdist": "",
    "Cnty": "",
    "CntyNm": "",
    "Phone": "",
    "Msa": "",
    "SbaOffice": "",
    "Zip": "",
    "E8a": "N",
    "wosb": "N",
    "HubCert": "N",
    "edwosb": "N",
    "vetsb": "N",
    "vetserdis": "N",
    "AnyAllNaics": "Any",
    "Naicses": "",
    "AnyAllGreen": "Any",
    "Greens": "",
    "AnyAllKeywords": "Any",
    "Keywords": "logistics",
    "KeyWhere": "O",
    "Cbonc": "",
    "Cbona": "",
    "Sbonc": "",
    "Sbona": "",
    "AtLeastNoMore": "N",
    "Anemp": "",
    "Agr": "",
    "Gcc": "N",
    "Gsa": "N",
    "ExportCd": "N",
    "CageCd": "",
    "UEI": "",
    "E8acase": "",
    "CompanyName": "",
    "CompanyNameSearch": "F",
    "UpdBefAft": "A",
    "Updated": "",
    "Status": "A",
    "NumberOfRows": "25",
    "FirmListColumns": "I01,I37,I35,P01,I11",
    "FirmListColumnNamesHidden": "Name of Firm;Contact;Address and City, State Zip;Capabilities Narrative;E-mail Address",
    "FirmListColumnNamesDisplay": "Name of Firm; Contact; Address and City, State Zip; Capabilities Narrative; E-mail Address",
    "FontSize": "10pt",
    "Report": "T",
    "Suffix": "xls",
    "Delimiter": "C",
    "Submit": "Search Using These Criteria"
}

# Send the POST request
response = requests.post(url, data=data)

# Print the response
print("Status Code:", response.status_code)
print("Response Text:", response.text)
