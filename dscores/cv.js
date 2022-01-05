class bb {
    static cvMap = [
        //    A      B      C      D      E      F      G      H            
          [0, 0,     0,     0,     0,     0,     0,     0,     0    ],     
          [0, 0,     0,     bb.ac, bb.ac, bb.ac, bb.ac, bb.ac, bb.ac], // A
          [0, 0,     0,     bb.ac, bb.bd, bb.be, bb.bf, bb.bf, bb.bf], // B
          [0, bb.ac, bb.ac, bb.cc, bb.cd, bb.cd, bb.cd, bb.cd, bb.cd], // C
          [0, bb.da, bb.bd, bb.cd, bb.dd, bb.dd, bb.dd, bb.dd, bb.dd], // D
          [0, bb.ac, bb.be, bb.cd, bb.dd, bb.dd, bb.dd, bb.dd, bb.dd], // E
          [0, bb.ac, bb.bf, bb.cd, bb.dd, bb.dd, bb.dd, bb.dd, bb.dd], // F
          [0, bb.ac, bb.bf, bb.cd, bb.dd, bb.dd, bb.dd, bb.dd, bb.dd], // G
          [0, bb.ac, bb.bf, bb.cd, bb.dd, bb.dd, bb.dd, bb.dd, bb.dd]  // H
    ];
    
    static ac(previous, current) {
        if (previous.category == "Turns" && current.category == "Turns") {
            return 1;
        }
        return 0;
    }
    
    static bd(previous, current) {
        if (previous.acro && current.acro) {
            if (previous.category == "Dismounts" || current.category == "Dismounts") {
                return 0;
            }
            if (previous.direction == "fwd" && current.direction == "fwd") {
                return 2;
            }
        } else if (previous.acro || current.acro) {
            return 1;
        }
        return 0;
    }
    
    static be(previous, current) {
        if (previous.acro && current.acro) {
            if (previous.category == "Dismounts" || current.category == "Dismounts") {
                return 0;
            }
            if (previous.direction != "fwd" || current.direction != "fwd") {
                return 1;
            }
        }
        return bb.bd(previous, current);
    }

    static bf(previous, current) {
        if (previous.acro && current.acro) {
            if (previous.value == 2 && previous.category == "Dismounts") {
                return 0;
            }
            if (current.value == 2 && current.category == "Dismounts") {
                return 0;
            }
            return 2;
        }
        return bb.bd(previous, current);
    }

    static cc(previous, current) {
        if (previous.acro && current.acro) {
            if (previous.category == "Dismounts" || current.category == "Dismounts") {
                return 0;
            }
            return 1;
        }
        if (!previous.acro && !previous.acro) {
            return 1;
        }
        return 0;
    }

    static cd(previous, current) {
        if (previous.acro && current.acro) {
            if (previous.category == "Dismounts" || current.category == "Dismounts") {
                return 0;
            }
            return 2;
        }
        return 1;
    }

    static da(previous, current) {
        if (!previous.isAerial && current.endsInScale) {
            return 1;
        }
        return bb.ac(previous, current);
    }
    
    static dd(previous, current) {
        if (previous.value < 6 && previous.category == "Dismounts") {
            return 0;
        }
        if (current.value < 6 && current.category == "Dismounts") {
            return 0;
        }
        return 2;
    }
}

class fx {
    static cvMap = [
        //    A      B      C      D      E      F      G      H      I      J      
          [0, 0,     0,     0,     0,     0,     0,     0,     0,     0,     0    ],     
          [0, 0,     0,     0,     fx.ad, fx.ae, fx.ae, fx.ae, fx.ae, fx.ae, fx.ae], // A
          [0, 0,     fx.bb, fx.bb, fx.bd, fx.ae, fx.ae, fx.ae, fx.ae, fx.ae, fx.ae], // B
          [0, 0,     fx.bb, fx.cc, fx.cd, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce], // C
          [0, fx.ad, fx.bd, fx.cd, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce], // D
          [0, fx.ae, fx.ae, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce], // E
          [0, fx.ae, fx.ae, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce], // F
          [0, fx.ae, fx.ae, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce], // G
          [0, fx.ae, fx.ae, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce], // H
          [0, fx.ae, fx.ae, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce], // I
          [0, fx.ae, fx.ae, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce, fx.ce], // J
    ];

    static ad(previous, current, i) {
        if (previous.acro && current.acro) {
            if (current.connectionType != "direct") {
                if (current.connectionType == "indirect" && i >= 2) {
                    return 1;
                }
                return 0;
            }
            return 1;
        }
        return 0;
    }

    static ae(previous, current, i) {
        if (previous.acro && current.acro) {
            if (current.connectionType != "direct") {
                if (current.connectionType == "indirect" && i >= 2) {
                    return 2;
                }
                return fx.ad(previous, current, i);
            }
            return 2;
        }
        if (previous.value >= 5 && !previous.isAerial && !current.acro) {
            return 1;
        }
        return 0;
    }

    static bb(previous, current, i) {
        if (previous.category == "Turns" && current.category == "Turns") {
            return 1;
        }
        return 0;
    }

    static bd(previous, current, i) {
        if (previous.acro && current.acro) {
            return 1;
        }
        if (previous.category == "Turns" && current.category == "Turns") {
            return 1;
        }
        if (previous.value >= 4 && !previous.isAerial && !current.acro) {
            return 1;
        }
        return 0;
    }

    static cc(previous, current, i) {
        if (previous.acro && current.acro && current.connectionType == "direct") {
            return 1;
        }
        return fx.bb(previous, current, i);
    }

    static cd(previous, current, i) {
        if (previous.acro && current.acro && current.connectionType == "direct") {
            return 2;
        }
        return fx.bd(previous, current, i);
    }

    static ce(previous, current) {
        if (previous.acro && current.acro) {
            return 2;
        }
        return fx.bd(previous, current, i);
    }
}


