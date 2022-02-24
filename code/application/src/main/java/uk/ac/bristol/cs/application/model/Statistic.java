package uk.ac.bristol.cs.application.model;

public class Statistic {
    private String code;
    private int occId;
    private String occName;
    private int men;
    private int women;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getOccId() {
        return occId;
    }

    public void setOccId(int occId) {
        this.occId = occId;
    }

    public String getOccName() {
        return occName;
    }

    public void setOccName(String occName) {
        this.occName = occName;
    }

    public int getMen() {
        return men;
    }

    public void setMen(int men) {
        this.men = men;
    }

    public int getWomen() {
        return women;
    }

    public void setWomen(int women) {
        this.women = women;
    }
    
    public int getTotal() {
        return women + men;
    }
}
