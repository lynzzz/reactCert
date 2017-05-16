import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import * as firebase from 'firebase';
import InsertClerkModal from "./InsertClerkModal"


class ClerkManager extends Component {

	constructor(props) {
		super(props);

    this.state = {
			clerkAffiliationArray : [{
				cId : "",
				city :"",
				hospital :"",
				nameEn : "",
				nameCh : "",
			}]
		}

    this.loadSummary = this.loadSummary.bind(this);
		this.onDeleteRecord = this.onDeleteRecord.bind(this);
    this.cellButton = this.cellButton.bind(this);

		firebase.database().ref('options').once('value').then(
			(options)=>{

				console.log("hospitals", options.val().hospitals);
				console.log("clerks", options.val().clerks)
			});

	}


  	loadSummary() {

			firebase.database().ref('options').once('value').then(
	      (options)=>{
					let newClerkAffiliationArray = [];
		      let clerks = options.val().clerks;
					let hospitals = options.val().hospitals;
		      let targetHospital = "";
					let city = "";

		      for( var keyClerk in clerks){

		           // Note : json array needs to be accessed by key
							 // ex : for ( let key in Jsonarray){ Jsonarray[key].attri}

						   // find the city and hospital to which the doctor belongs
							 for( var keyHospital in hospitals){
							     let hospital = hospitals[keyHospital];
									 let clerksOfHospital = hospital.clerks;
		               var found = false;
									 for(  let keyClerkOfHospital in clerksOfHospital){


		                    if ( keyClerkOfHospital === keyClerk){
												    targetHospital = hospitals[keyHospital].nameCh;
														city = hospitals[keyHospital].cityCh;
														found = true;
														break;
												}
									 }

									 if ( found){
										 break;
									 }
							 }

							 if ( !found ){
								 targetHospital = "";
								 city = "";
							 }


						   newClerkAffiliationArray.push({city :city, hospital :targetHospital, nameEn : clerks[keyClerk].nameEn, nameCh : clerks[keyClerk].nameCh})
					}


					let newState = Object.assign({}, this.state);
					newState.clerkAffiliationArray = newClerkAffiliationArray;
					this.setState(newState)
	      });
  	}


		onDeleteRecord(row) {


			if (confirm("Are you sure to delete this clerk?")) {

				firebase.database().ref('options').once('value').then(
					(options)=>{
						let hospitals = options.val().hospitals;
						let clerks = options.val().clerks;
						let bHospitalMatch = false;
						let bClerkMatch = false;
						let targetHospitalKey = null;
						let targetClerkKey = null;


						// Find  clerk from clerk table
						 for( var keyClerk in clerks){
								let clerk = clerks[keyClerk];

								if( row.nameCh === clerk.nameCh && row.nameEn === clerk.nameEn ){
										targetClerkKey = keyClerk;
										bClerkMatch = true;
										break;
								}
						}


            // Find clerk from hospital table
						for( let key in hospitals){
							 let hospital = hospitals[key];

							 // Find this hospital
							 if ( hospital.nameCh === row.hospital){

									 // Get hospital's clerks;
									let clerksID = hospital.clerks;

									// Check if this clerk belongs to this hospital
									for( let id in clerksID){
											if ( id === targetClerkKey){
												targetHospitalKey = key;
												bHospitalMatch = true;
												break;
											}
									}
							 }
						}

						if ( bClerkMatch ){

							// Delete clerk from clerk table
							firebase.database().ref('options/clerks/' + targetClerkKey).remove()
							console.log("Deleted clerk", targetClerkKey + " in clerk table");
						}

						if (bHospitalMatch){
							// Delete clerk from hospital table
							firebase.database().ref('options/hospitals/' + targetHospitalKey + "/clerks/" + targetClerkKey).remove()
              console.log("Deleted clerk " +  targetClerkKey + " in hospital", targetHospitalKey + " in hospital table");
						}

						// reload UI
						this.loadSummary();
					});
		  }
		}

		onEditRecord(row){

			firebase.database().ref('options').once('value').then(
				(options)=>{
					let hospitals = options.val().hospitals;
					let clerks = options.val().clerks;
					let newState = Object.assign({}, this.refs.refModal.states);
					let bHospitalMatch = false;
					let bClerkMatch = false;
					let targetHospitalKey = "";
					let targetClerkKey = "";


					// Find  clerk from clerk table
					 for( var keyClerk in clerks){
							var clerk = clerks[keyClerk];

							if( row.nameCh === clerk.nameCh && row.nameEn === clerk.nameEn ){
									targetClerkKey = keyClerk;
									bClerkMatch = true;
									break;
							}
					}


					// Find clerk from hospital table
					for( let key in hospitals){
						 let hospital = hospitals[key];

						 // Find this hospital
						 if ( hospital.nameCh === row.hospital){

								 // Get hospital's clerks;
								let clerksID = hospital.clerks;

								// Check if this doctor belongs to this hospital
								for( let id in clerksID){
										if ( id === targetClerkKey){
											targetHospitalKey = key;
											bHospitalMatch = true;

											break;
										}
								}
						 }
					}

					if ( bClerkMatch ){

						 newState.nameCh =  clerk.nameCh;
						 newState.nameEn =  clerk.nameEn;
						 newState.selHospital =  targetHospitalKey;


						 if ( clerk.hasOwnProperty("titleCh")){
							 newState.titleCh =  clerk.titleCh;
						 }else{
							 newState.titleCh = "";
						 }

						 if ( clerk.hasOwnProperty("titleEn")){
							 newState.titleEn =  clerk.titleEn;
						 }else{
							 newState.titleEn = "";
						 }
					}

          newState.originalClerkKeyFromEditButton = targetClerkKey;
					newState.fromEditButton = true;
					this.refs.refModal.setState(newState);
					this.refs.refModal.openModal();
				});
		}







		cellButton(cell, row, enumObject, rowIndex) {
			return (
				<div className="form-group">

					<div className="col-md-6">
						<button className="btn btn-primary" data-toggle="tooltip" title="Edit Record"
				          type="button"
									onClick={()=>this.onEditRecord(row)}
				       >
				       <span className="glyphicon glyphicon-edit"></span>
				       </button>
			       </div>
			       <div className="col-md-6">
				       <button className="btn btn-danger" data-toggle="tooltip" title="Delete Record"
				          type="button"
				          onClick={()=>this.onDeleteRecord(row)}
				       >
				       <span className="glyphicon glyphicon-trash"></span>
				       </button>
			       </div>

		       </div>
				)
		}


  componentWillMount() {
      this.loadSummary();
   }

	 componentDidMount(){
	 }

	render() {

		const options = {
		    defaultSortName: 'hospital',
		    defaultSortOrder: 'desc',
		    sizePerPage: 10,
	  };


		return (
      <div className="container">
            <div className="client-list">
                <div className="form-group">
                    <div className="col-md-10">
                    </div>
										<InsertClerkModal ref="refModal" hospitals={this.props.hospitals} clerkManager={this} />
                </div>
                <div className="form-group">
                    <div className="col-md-10">
                        <BootstrapTable data={this.state.clerkAffiliationArray} striped={true} hover={true} options={options} pagination ref='table'  >
                        <TableHeaderColumn hidden={true} isKey={true} dataAlign="center" dataField="cId"  dataSort={true} hiddenOnInsert autoValue>Id</TableHeaderColumn>
								        <TableHeaderColumn filter={ { type: 'TextFilter', delay: 100 } } dataField="city" dataAlign="center" dataSort={true}>City</TableHeaderColumn>
								        <TableHeaderColumn filter={ { type: 'TextFilter', delay: 100 } } dataField="hospital" dataAlign="center" dataSort={true}>Hospital</TableHeaderColumn>
                        <TableHeaderColumn filter={ { type: 'TextFilter', delay: 100 } } dataField="nameEn" dataAlign="center" dataSort={true}>Name (En)</TableHeaderColumn>
                        <TableHeaderColumn filter={ { type: 'TextFilter', delay: 100 } } dataField="nameCh" dataAlign="center" dataSort={true}>Name (Ch)</TableHeaderColumn>
								        <TableHeaderColumn dataField="operate" dataFormat={this.cellButton} ></TableHeaderColumn>
                        </BootstrapTable>
                   </div>
              </div>
          </div>
      </div>
    )
	}
}


export default ClerkManager;
