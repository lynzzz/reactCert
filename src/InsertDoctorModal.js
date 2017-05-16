import React from 'react';
import * as firebase from 'firebase';
import Select from 'react-select';
import { Modal, ModalBody, ModalFooter} from 'react-modal-bootstrap';


class InsertDoctorModal extends React.Component{
    constructor(props){
		    super(props)
		    this.state = {
            fromEditButton : false,
            originalDoctorKeyFromEditButton: "",
            isModalOpen : false,
            options : [],
            selHospital : "",
            hospitalAddressCh : "",
            hospitalAddressEn : "",
            nameCh : "",
            nameEn : "",
            titleCh : "",
            titleEn : "",
            licenseNumber : "",
		    }
  }

  openModal(){
    if ( !this.state.fromEditButton ){
        this.clearDoctorStatus();
        this.getAllHospitalList();
    }else{
      this.getEditHospitalList();
    }
		this.setState({isModalOpen : true})
	}

	closeModal(){
    this.setState({fromEditButton:false})
		this.setState({isModalOpen : false})
	}

  save(){

        /// New Doctor
       if ( !this.state.fromEditButton){
         // Add in doctor table in DB

           let newKey = firebase.database().ref("options/doctors").push().key;
           firebase.database().ref("options/doctors/"+ newKey).update({"hospitalAddressCh": this.state.hospitalAddressCh, "hospitalAddressEn": this.state.hospitalAddressEn, "nameCh":this.state.nameCh, "nameEn" : this.state.nameEn,  "titleCh":this.state.titleCh,
                "titleEn": this.state.titleEn, "licenseNumber":this.state.licenseNumber});

           console.log("Added doctor " + newKey + " in doctor table");




          // Add in hospital table in DB

          let hospitalDoctorPath = "options/hospitals/" + this.state.selHospital + "/doctors/" + newKey;
          firebase.database().ref(hospitalDoctorPath).set(true);
           console.log("Added doctor " + newKey + " to hospital " + this.state.selHospital + " in hospital table");

      // Edit Doctor
      }else{

          let doctorKeyFromEdit = this.state.originalDoctorKeyFromEditButton;

          firebase.database().ref("options/doctors/"+ doctorKeyFromEdit).update({"hospitalAddressCh": this.state.hospitalAddressCh, "hospitalAddressEn": this.state.hospitalAddressEn, "nameCh":this.state.nameCh, "nameEn" : this.state.nameEn,  "titleCh":this.state.titleCh,
                     "titleEn": this.state.titleEn, "licenseNumber":this.state.licenseNumber});

          console.log("Updated doctor " + doctorKeyFromEdit + " in doctor table");
    }


      // refresh UI
      this.props.doctorManager.loadSummary();

      this.setState({fromEditButton:false})

      this.closeModal();
}

  clearDoctorStatus(){
    this.setState({"nameCh": ""});
    this.setState({"nameEn": ""});
    this.setState({"hospitalAddressCh": ""});
    this.setState({"hospitalAddressEn": ""});
    this.setState({"titleCh": ""});
    this.setState({"titleEn": ""});
    this.setState({"licenseNumber": ""});
    this.setState({"selHospital":""})
    this.setState({"originalDoctorKeyFromEditButton":""})
  }


  getAllHospitalList(){
    let ret = [];
    let h= this.props.hospitals;
    for( let key in h){
      let hospital = h[key];
      ret.push({"value" : key, "label" : hospital.nameCh});
    }

    this.setState({options : ret});
  }

  getEditHospitalList(){
    let ret = [];
    let h= this.props.hospitals;
    let hospital = h[this.state.selHospital];
    if ( hospital === undefined ){
      ret.push({"value" : "", "label" : ""});
    }else{
      ret.push({"value" : this.state.selHospital, "label" : hospital.nameCh});
    }
    this.setState({options : ret});
  }



  render(){

		return(
			<div>
          <button className="btn btn-primary" id="addDoctorButton" onClick={()=>this.openModal()}>
          <span className="glyphicon glyphicon-plus"></span> Add Doctor
          </button>
          <Modal isOpen={this.state.isModalOpen} contentLabel="New Doctor">
					<ModalBody>
           <div className="panel panel-primary">

            <div className="panel-heading">Add Doctor</div>

              <div className="panel-body">
                <form className="form-horizontal" >
                   <div className="form-group">
                       <label className="control-label col-sm-3">Hospital</label>
                       <div className="col-md-6">
                       <Select
                              options={this.state.options}
                              onChange={e=>this.setState({selHospital : e.value})}
                              value={this.state.selHospital}
                       />
                       </div>
                  </div>

                  <div className="form-group">
                      <label className="control-label col-sm-3">Address(Ch)</label>
                      <div className="col-md-6">
                      <input type="text" className="form-control" id="hospitalAddressCh" value={this.state.hospitalAddressCh} onChange={ event => this.setState({hospitalAddressCh: event.target.value})} />
                      </div>
                 </div>

                 <div className="form-group">
                     <label className="control-label col-sm-3">Address(En)</label>
                     <div className="col-md-6">
                     <input type="text" className="form-control" id="hospitalAddressEn" value={this.state.hospitalAddressEn} onChange={event => this.setState({hospitalAddressEn : event.target.value})}/>
                     </div>
                </div>

                <div className="form-group">
                    <label className="control-label col-sm-3">Name(Ch)</label>
                    <div className="col-md-6">
                    <input type="text" className="form-control" id="nameCh" value={this.state.nameCh} required onChange={e=> this.setState({nameCh : e.target.value})} />
                    </div>
               </div>

               <div className="form-group">
                   <label className="control-label col-sm-3">Name(En)</label>
                   <div className="col-md-6">
                   <input type="text" className="form-control" id="nameEn" value={this.state.nameEn} required onChange={e=>this.setState({nameEn : e.target.value})}/>
                   </div>
              </div>

              <div className="form-group">
                  <label className="control-label col-sm-3">Title(Ch)</label>
                  <div className="col-md-6">
                  <input type="text" className="form-control" id="titleCh" value={this.state.titleCh} onChange={e=>this.setState({titleCh : e.target.value})}/>
                  </div>
             </div>

             <div className="form-group">
                 <label className="control-label col-sm-3">Title(En)</label>
                 <div className="col-md-6">
                 <input type="text" className="form-control" id="titleEn" value={this.state.titleEn} onChange={e=> this.setState({titleEn : e.target.value})}/>
                 </div>
            </div>

            <div className="form-group">
                <label className="control-label col-sm-3">License Number</label>
                <div className="col-md-6">
                <input type="text" className="form-control" id="licenseNumber" value={this.state.licenseNumber}onChange={e=>this.setState({licenseNumber : e.target.value})}/>
                </div>
           </div>

                </form>
              </div>
            </div>





					</ModalBody>


          <ModalFooter>
					    <button className="btn btn-primary" onClick={()=>this.save() }>save</button>
					    <button className='btn btn-default' onClick={()=>this.closeModal()}>cancel</button>
          </ModalFooter>





          </Modal>



			</div>
		);
	};

}


export default InsertDoctorModal;
