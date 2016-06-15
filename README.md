# leaflet-edit-polygon-wfst
This leaflet web mapping app enables the user to create, edit and delete polygons using a wfs-t. 

**Requirements**
* Leaflet 0.7.7 (http://leafletjs.com/download.html)
* Webserver (e.g. Apache Tomcat)
* PostgreSQL/PostGIS Database
* Geoserver

**Usage**

1. Clone/download the leaflet-edit-polygon-wfst-repository
2. Create the PostgreSQL/PostGIS database table according to file 'database/create_table_statements_edit_polygon.sql'
3. Publish table/layer as a Geoserver web service
4. Edit the options of the L.WFST-extension ('js/main.js' lines 445-452)
5. Put your leaflet-edit-polygon-wfst-repository on your webserver

![](http://i.imgur.com/LTpQApP.png)


Contact
-------
Contact: office.ispace@researchstudio.at<br />
www.researchstudio.at<br />

LICENSE
-------
The MIT License (MIT)

Copyright (C) 2016 by Studio iSPACE, Researchstudios Austria Forschungsgesellschaft mbH. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
