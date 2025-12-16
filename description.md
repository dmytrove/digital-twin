We need you to plan and setup a live design demo using Autodesk Forge or similar. The Proof Of Concept (POC) is to show the team how design will be delivered in the future 

1.	Background
We have a customer with approximately 800 offices around the US that have IT/Data equipment – mainly racks with equipment modules (plus fiber-related and power related equipment)

We are making a proposal to 
•	3D Site Capture - digitally capture these offices 
•	Model the “As-Is” in Revit to BIM standards 
•	Publish the Revit file with key functionality as noted below


2.	Key Functionality in Read Only Viewer
The customer should be able to access the viewer as a URL and on the page, there should be the following UI elements

1.	Layer controls that allow the user to toggle each of the following “4d status” layers independently; the “4d status” is with respect to the next deployment

a.	“Existing To Be Retained” – all “As-Is” equipment 
b.	“Existing To Be Removed”
c.	“Proposed” – to be added in the deployment
d.	“Future” – this would be for planning ahead, to reserve space
e.	“Modified” – this would be re-located equipment. This equipment should have 2 places but be the same equipment – so it should have its current and future locations
2.	Colour coding – we would want to be able to select
a.	“4D Status” – this would colour the equipment 

 
 
b.	“Customer” – we would not need any functionality here yet – just to show the future intent
c.	“Power Consumption” – we would not need any functionality here yet – just to show the future intent

3.	Hide the building
a.	We would want the ability to toggle on/off for ease of viewing the equipment
4.	Inventory – button to bring up a table 
a.	This could possibly be in a separate tab but preferably it would be on the screen – it only needs to show say 5 rows at a time
b.	Ideally this would bring up a full table of the equipment with many of the BIM fields 
c.	Ideally we would be able to select an item of equipment from the BIM viewer and it would be highlighted in the Inventory table and also if we select an item from the table, it should be highlighted in the BIM Viewer



3.	How the live demo should work 

Map Page
•	Customer goes to a simple map page
•	Selects the demo site which takes them to…

Site Page – BIM Viewer
•	Page is the 3D BIM Viewer plus the required UI elements to drive the demo
•	We explain the UI and set up the demo…
o	This is an “As-Is” model of  site XYZ
o	We get the customer to play with the UI options – layers, colour coding, turn building off, Inventory etc
o	Review the 2D Drawings
•	Design scenario: We invite the customer to make up a small / simple demo scope – something to the effect of…
o	Nominate 2 items to be removed from Rack X…
o	Nominate 3 items to be added to Rack X and 2 to Rack Y
o	Nominate a new Future rack + Future rack equipment
o	We take a screenshot of the racks and we mark them up quickly with the adds/removes
•	Revit Modeler shares screen and shows how
o	Changes the 4d Status of the 2 items
o	Loads the 3 new equipment items and sets their 4D Status
o	Positions the equipment 
o	Hits Save (and Publish?)
•	Back to the customer – (maybe he has to refresh the page?). Now we guide the customer as follows…
o	Turn off the building
o	Turn on Colour coding – see how we now have 4 colours showing the full design (all layers except for modified – we wont play with that in this demo)
o	Turn on/off the layers – so you can see 
	“As-Is” = Existing To Be Retained + Existing To Be Removed)
	“To-Be” = Existing To Be Retained+ Proposed). Note - Existing To Be Removed is turned off)
	“Future” = Existing To Be Retained+ Proposed + Future.
o	Load the Inventory – we would guide customer…
	See the inventory – how the 4D Status column has conditional formatting (to coincide with the colour scheme for the layers)
	See how you can select an item and its highlighted in the 3D View
	Capture a screenshot
	Review the 2D Drawings
o	Post deployment update – we would assume that the design has just been completed and we are now updating the BIM file so that it reflects the new “As-Is”
	Revit - we run a script that updates…
•	Added equipment – script changes the 4d status from Proposed to As-Is with notes added about the dates etc
•	Removed equipment – the script updates the de-commissioning details and removes the equipment (is this correct approach or should the equipment live in the file but be out of sight?)
o	Summarise
	Recap on the 3 phases
	Compare the earlier screenshot plus the demo instruction and validate that the design is 100% correct
	Discuss the speed and how this approach means that the outputs are accurate and how we maintain the accuracy over time
