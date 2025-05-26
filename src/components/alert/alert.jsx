import {Alert} from "react-bootstrap"

export const AlertDangerComponent = ({message, heading = "Terjadi Kesalahan"}) => {
 return (
  <Alert variant="danger">
   <Alert.Heading>{heading}</Alert.Heading>
   <div>{message}</div>
  </Alert>
 )
}

export const AlertSuccessComponent = ({message, heading = "Berhasil"}) => {
 return (
  <Alert variant="success">
   <Alert.Heading>{heading}</Alert.Heading>
   <div>{message}</div>
  </Alert>
 )
}
