/* eslint-disable no-use-before-define */
import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

export default function AutoCompleteSelect(props) {
  return (
    <Autocomplete
      id="combo-box-demo"
      options={cities}
      onChange={(e, v) => {
        props.handleChange(v?.sys);
      }}
      getOptionLabel={(option) => option?.sys}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          margin="dense"
          label={props.label}
        />
      )}
    />
  );
}

const cities = [
  { name: "adama", sys: "Adama" },
  { name: "addisababa", sys: "Addis Ababa" },
  { name: "adigrat", sys: "Adigrat" },
  { name: "adwa", sys: "Adwa" },
  { name: "agaro", sys: "Agaro" },
  { name: "alabakulito", sys: "Alaba Kulito" },
  { name: "alamata", sys: "Alamata" },
  { name: "alemaya", sys: "Alemaya" },
  { name: "aletawendo", sys: "Aleta Wendo" },
  { name: "ambo", sys: "Ambo" },
  { name: "arbaminch", sys: "Arba Minch" },
  { name: "areka", sys: "Areka" },
  { name: "arsinegele", sys: "Arsi Negele" },
  { name: "asella", sys: "Asella" },
  { name: "asosa", sys: "Asosa" },
  { name: "ayera", sys: "Ayera" },
  { name: "axum", sys: "Axum" },
  { name: "bahirbar", sys: "Bahir Dar" },
  { name: "balerobe", sys: "Bale Robe" },
  { name: "bishoftu", sys: "Bishoftu" },
  { name: "boditi", sys: "Boditi" },
  { name: "bonga", sys: "Bonga" },
  { name: "bulehora", sys: "Bule Hora Town" },
  { name: "burayu", sys: "Burayu" },
  { name: "butajira", sys: "Butajira" },
  { name: "chagni", sys: "Chagni" },
  { name: "chiro", sys: "Chiro" },
  { name: "dangila", sys: "Dangila" },
  { name: "deberewereke", sys: "Debere wereke" },
  { name: "debrebirhan", sys: "Debre Birhan" },
  { name: "debremarkos", sys: "Debre Markos" },
  { name: "debretabor", sys: "Debre Tabor" },
  { name: "degehabur", sys: "Degehabur" },
  { name: "dembidolo", sys: "Dembi Dolo" },
  { name: "dessie", sys: "Dessie" },
  { name: "dilla", sys: "Dilla" },
  { name: "dejene", sys: "Dejene" },
  { name: "diredawa", sys: "Dire Dawa" },
  { name: "durame", sys: "Durame" },
  { name: "fiche", sys: "Fiche" },
  { name: "finoteselam", sys: "Finote Selam" },
  { name: "gambela", sys: "Gambela" },
  { name: "gimbi", sys: "Gimbi" },
  { name: "goba", sys: "Goba" },
  { name: "gode", sys: "Gode" },
  { name: "gondar", sys: "Gondar" },
  { name: "harar", sys: "Harar" },
  { name: "hawassa", sys: "Hawassa" },
  { name: "hosaena", sys: "Hosaena" },
  { name: "jijiga", sys: "Jijiga" },
  { name: "jimma", sys: "Jimma" },
  { name: "jinka", sys: "Jinka" },
  { name: "kobo", sys: "Kobo" },
  { name: "kombolcha", sys: "Kombolcha" },
  { name: "mekelle", sys: "Mekelle" },
  { name: "keki", sys: "Meki" },
  { name: "metu", sys: "Metu" },
  { name: "mizanteferi", sys: "Mizan Teferi" },
  { name: "modjo", sys: "Modjo" },
  { name: "mota", sys: "Mota" },
  { name: "negeleborana", sys: "Negele Borana" },
  { name: "nekemte", sys: "Nekemte" },
  { name: "sawla", sys: "Sawla" },
  { name: "sebeta", sys: "Sebeta" },
  { name: "shashamane", sys: "Shashamane" },
  { name: "shireindaselassie", sys: "Shire Inda Selassie" },
  { name: "sodo", sys: "Sodo" },
  { name: "tepi", sys: "Tepi" },
  { name: "welkite", sys: "Welkite" },
  { name: "wolaitadimtu", sys: "Wolaita Dimtu" },
  { name: "woldiya", sys: "Woldiya" },
  { name: "woliso", sys: "Woliso" },
  { name: "wukro", sys: "Wukro" },
  { name: "yirgalem", sys: "Yirgalem" },
  { name: "ziway", sys: "Ziway" },
];
