import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn, InsertButton} from 'react-bootstrap-table';
import * as firebase from 'firebase';
import InsertDoctorModal from "./InsertDoctorModal"


class DoctorManager extends Component {

	constructor(props) {
		super(props);

    this.state = {
			doctorAffiliationArray : [{
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
				console.log("Doctors", options.val().doctors)
			});

	}


  	loadSummary() {

			firebase.database().ref('options').once('value').then(
	      (options)=>{
					let newdoctorAffiliationArray = [];
		      let doctors = options.val().doctors;
					let hospitals = options.val().hospitals;
		      let targetHospital = null;
					let city = null;

		      for( var keyDoctor in doctors){

		           // Note : json array needs to be accessed by key
							 // ex : for ( let key in Jsonarray){ Jsonarray[key].attri}

						   // find the city and hospital to which the doctor belongs
							 for( var keyHospital in hospitals){
							     let hospital = hospitals[keyHospital];
									 let doctorsOfHospital = hospital.doctors;
		               let found = false;
									 for(  let keydoctorOfHospital in doctorsOfHospital){


		                    if ( keydoctorOfHospital === keyDoctor){
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


						   newdoctorAffiliationArray.push({city :city, hospital :targetHospital, nameEn : doctors[keyDoctor].nameEn, nameCh : doctors[keyDoctor].nameCh})
					}


					let newState = Object.assign({}, this.state);
					newState.doctorAffiliationArray = newdoctorAffiliationArray;
					this.setState(newState)
	      });
  	}


		onDeleteRecord(row) {
			if (confirm("Are you sure to delete this doctor?")) {

				firebase.database().ref('options').once('value').then(
					(options)=>{
						let hospitals = options.val().hospitals;
						let doctors = options.val().doctors;
						let bHospitalMatch = false;
						let bDoctorMatch = false;
						let targetHospitalKey = null;
						let targetDoctorKey = null;


						// Find  doctor from doctor table
						 for( var keyDoctor in doctors){
								let doctor = doctors[keyDoctor];

								if( row.nameCh === doctor.nameCh && row.nameEn === doctor.nameEn ){
										targetDoctorKey = keyDoctor;
										bDoctorMatch = true;
										break;
								}
						}


            // Find doctor from hospital table
						for( let key in hospitals){
							 let hospital = hospitals[key];

							 // Find this hospital
							 if ( hospital.nameCh == row.hospital){

									 // Get hospital's doctors;
									let doctorsID = hospital.doctors;

									// Check if this doctor belongs to this hospital
									for( let id in doctorsID){
											if ( id === targetDoctorKey){
												targetHospitalKey = key;
												bHospitalMatch = true;
												break;
											}
									}
							 }
						}

						if ( bDoctorMatch ){

							// Delete doctor collection in database
							firebase.database().ref('options/doctors/' + targetDoctorKey).remove()
							console.log("Deleted doctor", targetDoctorKey + " in doctor table");
						}

						if (bHospitalMatch){
							// Delete hospital collection in database
							console.log("Deleted doctor " +  targetDoctorKey + " in hospital", targetHospitalKey + " in hospital table");
							firebase.database().ref('options/hospitals/' + targetHospitalKey + "/doctors/" + targetDoctorKey).remove()
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
					let doctors = options.val().doctors;
					let newState = Object.assign({}, this.refs.refModal.states);
					let bHospitalMatch = false;
					let bDoctorMatch = false;
					let targetHospitalKey = null;
					let targetDoctorKey = null;


					// Find  doctor from doctor table
					 for( var keyDoctor in doctors){
							var doctor = doctors[keyDoctor];

							if( row.nameCh === doctor.nameCh && row.nameEn === doctor.nameEn ){
									targetDoctorKey = keyDoctor;
									bDoctorMatch = true;
									break;
							}
					}


					// Find doctor from hospital table
					for( let key in hospitals){
						 let hospital = hospitals[key];

						 // Find this hospital
						 if ( hospital.nameCh == row.hospital){

								 // Get hospital's doctors;
								let doctorsID = hospital.doctors;

								// Check if this doctor belongs to this hospital
								for( let id in doctorsID){
										if ( id === targetDoctorKey){
											targetHospitalKey = key;
											bHospitalMatch = true;

											break;
										}
								}
						 }
					}

					if ( bDoctorMatch ){

						 newState.nameCh =  doctor.nameCh;
						 newState.nameEn =  doctor.nameEn;
						 newState.selHospital =  targetHospitalKey;

						 if ( doctor.hasOwnProperty("hospitalAddressCh")){
							 newState.hospitalAddressCh =  doctor.hospitalAddressCh;
						 }else{
							 newState.hospitalAddressCh = "";
						 }

						 if ( doctor.hasOwnProperty("hospitalAddressEn")){
							 newState.hospitalAddressEn =  doctor.hospitalAddressEn;
						 }else{
							 newState.hospitalAddressEn =  "";
						 }

						 if ( doctor.hasOwnProperty("titleCh")){
							 newState.titleCh =  doctor.titleCh;
						 }else{
							 newState.titleCh = "";
						 }

						 if ( doctor.hasOwnProperty("titleEn")){
							 newState.titleEn =  doctor.titleEn;
						 }else{
							 newState.titleEn = "";
						 }

						 if ( doctor.hasOwnProperty("licenseNumber")){
							 newState.licenseNumber =  doctor.licenseNumber;
						 }else{
							 newState.licenseNumber = "";
						 }
					}

          newState.originalDoctorKeyFromEditButton = targetDoctorKey;
					newState.orignailHospitalKeyFromEditButton = targetHospitalKey;
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
		    defaultSortName: 'city',
		    defaultSortOrder: 'desc',
		    sizePerPage: 10,
	  };


		return (
      <div className="container">
            <div className="client-list">
                <div className="form-group">
                    <div className="col-md-10">
                    </div>
										<InsertDoctorModal ref= "refModal" hospitals = {this.props.hospitals} doctorManager = {this} />
                </div>
                <div className="form-group">
                    <div className="col-md-10">
                        <BootstrapTable data={this.state.doctorAffiliationArray} striped={true} hover={true} options={options} pagination ref='table'  >
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


export default DoctorManager;
