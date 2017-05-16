import React from 'react';
import * as firebase from 'firebase';
import Select from 'react-select';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter} from 'react-modal-bootstrap';


class InsertDoctorModal extends React.Component{
    constructor(props){
		    super(props)
		    this.state = {
            fromEditButton : false,
            originalClerkKeyFromEditButton: "",
            isModalOpen : false,
            options : [],
            selHospital : "",
            nameCh : "",
            nameEn : "",
            titleCh : "",
            titleEn : "",
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

        /// New Clerk
       if ( !this.state.fromEditButton){
         // Add Clerk in clerk table

           let newKey = firebase.database().ref("options/clerks").push().key;
           firebase.database().ref("options/clerks/"+ newKey).update({"nameCh":this.state.nameCh, "nameEn" : this.state.nameEn,  "titleCh":this.state.titleCh,
                "titleEn": this.state.titleEn});

           console.log("Added clerk " + newKey + " in clerk table");




          // Add clerk in hospital table
          let hospitalDoctorPath = "options/hospitals/" + this.state.selHospital + "/clerks/" + newKey;
          firebase.database().ref(hospitalDoctorPath).set(true);
           console.log("Added clerk " + newKey + " to hospital " + this.state.selHospital + " in hospital table");

      // Edit Clerk
      }else{

          let clerkKeyFromEdit = this.state.originalClerkKeyFromEditButton;

          firebase.database().ref("options/clerks/"+ clerkKeyFromEdit).update({"nameCh":this.state.nameCh, "nameEn" : this.state.nameEn,  "titleCh":this.state.titleCh,
                     "titleEn": this.state.titleEn});

          console.log("Updated clerk " + clerkKeyFromEdit + " in clerk table");
    }


      // refresh UI
      this.props.clerkManager.loadSummary();

      this.setState({fromEditButton:false})

      this.closeModal();
}

  clearDoctorStatus(){
    this.setState({"nameCh": ""});
    this.setState({"nameEn": ""});
    this.setState({"titleCh": ""});
    this.setState({"titleEn": ""});
    this.setState({"selHospital":""})
    this.setState({"originalClerkKeyFromEditButton":""})
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
    ret.push({"value" : this.state.selHospital, "label" : hospital.nameCh});
    this.setState({options : ret});
  }



  render(){

		return(
			<div>
          <button className="btn btn-primary" id="addDoctorButton" onClick={()=>this.openModal()}>
          <span className="glyphicon glyphicon-plus"></span> Add Clerk
          </button>
          <Modal isOpen={this.state.isModalOpen} contentLabel="New Clerk">
					<ModalBody>
           <div className="panel panel-primary">

            <div className="panel-heading">Add Clerk</div>

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
